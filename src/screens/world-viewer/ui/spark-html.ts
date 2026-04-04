/**
 * Self-contained HTML template for rendering Gaussian Splats via SparkJS.
 * Loaded into a WebView with the .spz URL injected dynamically.
 */
export function buildSparkHTML(spzUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #111827; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; }
    #loading {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      background: #111827; color: #9CA3AF;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      z-index: 100;
    }
    #loading.hidden { display: none; }
    #loading-text { font-size: 14px; margin-top: 16px; }
    #loading-progress { font-size: 12px; color: #6B7280; margin-top: 8px; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #1F2937; border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #error {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: none; flex-direction: column;
      justify-content: center; align-items: center;
      background: #111827; color: #EF4444;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 32px; text-align: center; z-index: 100;
    }
    #error.show { display: flex; }
    #error-msg { font-size: 14px; margin-top: 12px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <div id="loading-text">Loading 3D World...</div>
    <div id="loading-progress"></div>
  </div>
  <div id="error">
    <div style="font-size: 40px;">⚠️</div>
    <div id="error-msg">Failed to load 3D world</div>
  </div>

  <script type="importmap">
    {
      "imports": {
        "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.178.0/three.module.js",
        "@sparkjsdev/spark": "https://sparkjs.dev/releases/spark/0.1.10/spark.module.js"
      }
    }
  </script>
  <script type="module">
    import * as THREE from "three";
    import { SplatMesh } from "@sparkjsdev/spark";

    const loadingEl = document.getElementById("loading");
    const loadingProgress = document.getElementById("loading-progress");
    const errorEl = document.getElementById("error");
    const errorMsg = document.getElementById("error-msg");

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111827);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
      );
      camera.position.set(0, 0, 2);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      document.body.appendChild(renderer.domElement);

      // Load splat
      const spzUrl = "${spzUrl}";
      const splatMesh = new SplatMesh({ url: spzUrl });

      // Re-orient from OpenCV to OpenGL coordinates
      splatMesh.quaternion.set(1, 0, 0, 0);
      splatMesh.position.set(0, 0, 0);
      scene.add(splatMesh);

      // Simple orbit controls (touch-friendly)
      let isDragging = false;
      let prevX = 0, prevY = 0;
      let theta = 0, phi = Math.PI / 2;
      let radius = 2;
      let targetX = 0, targetY = 0;

      function updateCamera() {
        camera.position.x = targetX + radius * Math.sin(phi) * Math.cos(theta);
        camera.position.y = targetY + radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(targetX, targetY, 0);
      }

      // Touch events
      renderer.domElement.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
        }
      }, { passive: false });

      renderer.domElement.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
          const dx = e.touches[0].clientX - prevX;
          const dy = e.touches[0].clientY - prevY;
          theta -= dx * 0.005;
          phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * 0.005));
          prevX = e.touches[0].clientX;
          prevY = e.touches[0].clientY;
          updateCamera();
        } else if (e.touches.length === 2) {
          // Pinch to zoom
          const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (prevPinchDist > 0) {
            radius *= prevPinchDist / d;
            radius = Math.max(0.5, Math.min(10, radius));
            updateCamera();
          }
          prevPinchDist = d;
        }
      }, { passive: false });

      let prevPinchDist = 0;

      renderer.domElement.addEventListener("touchend", () => {
        isDragging = false;
        prevPinchDist = 0;
      });

      // Mouse events (for testing in browser)
      renderer.domElement.addEventListener("mousedown", (e) => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
      });
      renderer.domElement.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        theta -= dx * 0.005;
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * 0.005));
        prevX = e.clientX;
        prevY = e.clientY;
        updateCamera();
      });
      renderer.domElement.addEventListener("mouseup", () => { isDragging = false; });
      renderer.domElement.addEventListener("wheel", (e) => {
        radius += e.deltaY * 0.01;
        radius = Math.max(0.5, Math.min(10, radius));
        updateCamera();
      });

      // Resize handling
      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      // Hide loading after a timeout (splat loading is async inside SplatMesh)
      setTimeout(() => {
        loadingEl.classList.add("hidden");
      }, 3000);

      // Render loop
      updateCamera();
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

    } catch (err) {
      loadingEl.classList.add("hidden");
      errorEl.classList.add("show");
      errorMsg.textContent = err.message || "Failed to load 3D world";
    }
  </script>
</body>
</html>`
}
