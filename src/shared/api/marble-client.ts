import * as FileSystem from 'expo-file-system/legacy'

const MARBLE_BASE_URL = 'https://api.worldlabs.ai/marble/v1'

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_MARBLE_API_KEY
  if (!key || key === 'your_marble_api_key_here') {
    throw new MarbleApiError(
      0,
      'Marble API key is not configured. Set EXPO_PUBLIC_MARBLE_API_KEY in .env'
    )
  }
  return key
}

// --- Types ---

export type MarbleModel = 'Marble 0.1-mini' | 'Marble 0.1-plus'

export type PrepareUploadResponse = {
  media_asset: {
    media_asset_id: string
    file_name: string
    kind: string
    extension: string
    created_at: string
  }
  upload_info: {
    upload_url: string
    upload_method: string
    required_headers: Record<string, string>
  }
}

export type OperationProgress = {
  status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
  description: string
}

export type OperationError = {
  code: number | null
  message: string | null
}

export type WorldAssets = {
  caption: string
  thumbnail_url: string
  splats: {
    spz_urls: {
      '100k': string
      '500k': string
      full_res: string
    }
  }
  mesh: {
    collider_mesh_url: string
  }
  imagery: {
    pano_url: string
  }
}

export type WorldResponse = {
  world_id: string
  display_name: string
  tags: string[] | null
  world_marble_url: string
  assets: WorldAssets
  created_at: string | null
  updated_at: string | null
  model: MarbleModel | null
}

export type OperationResponse = {
  operation_id: string
  created_at: string
  updated_at: string
  expires_at: string
  done: boolean
  error: OperationError | null
  metadata: {
    progress: OperationProgress
    world_id: string
  } | null
  response: WorldResponse | null
}

export type GenerateWorldRequest = {
  display_name?: string
  model?: MarbleModel
  world_prompt: WorldPrompt
}

type WorldPrompt =
  | { type: 'text'; text_prompt: string }
  | { type: 'image'; image_prompt: ImageSource; text_prompt?: string }
  | {
      type: 'multi-image'
      multi_image_prompt: SphericalImage[]
      text_prompt?: string
      reconstruct_images?: boolean
    }

type ImageSource =
  | { source: 'uri'; uri: string }
  | { source: 'media_asset'; media_asset_id: string }

type SphericalImage = {
  azimuth?: number
  content: ImageSource
}

// --- Error ---

export class MarbleApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'MarbleApiError'
  }
}

// --- Client ---

async function marbleRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${MARBLE_BASE_URL}${path}`
  const headers: Record<string, string> = {
    'WLT-Api-Key': getApiKey(),
    'Content-Type': 'application/json',
  }

  console.log(`[Marble API] Requesting ${method} ${url}`, body ? JSON.stringify(body, null, 2) : '')

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  console.log(`[Marble API] Response Status: ${response.status}`)

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    let errorMessage = `Marble API error (${response.status})`

    try {
      const parsed = JSON.parse(errorBody)
      const rawMessage = parsed.detail || parsed.message || errorMessage
      errorMessage =
        typeof rawMessage === 'object' ? JSON.stringify(rawMessage) : String(rawMessage)
      console.error(`[Marble API] Error Detail:`, rawMessage)
    } catch {
      console.error(`[Marble API] Raw Error Body:`, errorBody)
    }

    switch (response.status) {
      case 400:
        throw new MarbleApiError(400, `Invalid request: ${errorMessage}`)
      case 402:
        throw new MarbleApiError(
          402,
          'Insufficient Marble credits. Please add credits at platform.worldlabs.ai/billing'
        )
      case 429:
        throw new MarbleApiError(429, 'Rate limited. Please wait a moment and try again.', true)
      default:
        throw new MarbleApiError(response.status, errorMessage, response.status >= 500)
    }
  }

  return response.json() as Promise<T>
}

/** Step 1: Prepare a media asset upload (get signed GCS URL) */
export async function prepareUpload(
  fileName: string,
  extension: string = 'jpg'
): Promise<PrepareUploadResponse> {
  return marbleRequest<PrepareUploadResponse>('POST', '/media-assets:prepare_upload', {
    file_name: fileName,
    kind: 'image',
    extension,
  })
}

/** Step 2: Upload file binary to signed GCS URL */
export async function uploadFileToGCS(
  uploadUrl: string,
  localFilePath: string,
  requiredHeaders: Record<string, string>
): Promise<void> {
  console.log(`[Marble API] Uploading ${localFilePath} to GCS...`)
  const result = await FileSystem.uploadAsync(uploadUrl, localFilePath, {
    httpMethod: 'PUT',
    headers: requiredHeaders,
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  })
  console.log(`[Marble API] Upload finished. Status: ${result.status}`)

  if (result.status < 200 || result.status >= 300) {
    throw new MarbleApiError(result.status, `File upload failed: HTTP ${result.status}`)
  }
}

/** Step 3: Generate a world from multi-image prompt */
export async function generateWorld(params: {
  displayName?: string
  model?: MarbleModel
  images: { mediaAssetId: string; azimuth: number }[]
  textPrompt?: string
  reconstructImages?: boolean
}): Promise<OperationResponse> {
  // Validate all images have media_asset_id
  const missingIndices = params.images
    .map((img, i) => (!img.mediaAssetId || img.mediaAssetId.trim() === '' ? i : -1))
    .filter((i) => i >= 0)

  if (missingIndices.length > 0) {
    throw new MarbleApiError(
      0,
      `Missing media_asset_id for image(s) at index ${missingIndices.join(', ')}. Upload may have failed.`
    )
  }

  const body: GenerateWorldRequest = {
    display_name: params.displayName,
    model: params.model ?? 'Marble 0.1-mini',
    world_prompt: {
      type: 'multi-image',
      multi_image_prompt: params.images.map((img) => ({
        azimuth: img.azimuth,
        content: {
          source: 'media_asset' as const,
          media_asset_id: img.mediaAssetId,
        },
      })),
      text_prompt: params.textPrompt,
      reconstruct_images: params.reconstructImages ?? true,
    },
  }

  console.log('[Marble API] Generate world payload:', JSON.stringify(body.world_prompt, null, 2))

  return marbleRequest<OperationResponse>('POST', '/worlds:generate', body)
}

/** Step 4: Poll operation status */
export async function getOperation(operationId: string): Promise<OperationResponse> {
  return marbleRequest<OperationResponse>('GET', `/operations/${operationId}`)
}

/** Step 5: Get world by ID */
export async function getWorld(worldId: string): Promise<{ world: WorldResponse }> {
  return marbleRequest<{ world: WorldResponse }>('GET', `/worlds/${worldId}`)
}

/** Helper: Upload a single captured image and return its media_asset_id */
export async function uploadCapturedImage(localPath: string, index: number): Promise<string> {
  const fileName = `capture-${index}.jpg`
  const { media_asset, upload_info } = await prepareUpload(fileName, 'jpg')

  await uploadFileToGCS(upload_info.upload_url, localPath, upload_info.required_headers)

  return media_asset.media_asset_id
}
