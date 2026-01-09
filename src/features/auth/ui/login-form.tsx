import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { z } from 'zod'
import { useLogin } from '../api/use-login'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder='Enter your email'
              autoCapitalize='none'
              keyboardType='email-address'
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder='Enter your password'
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </View>

      <View style={{ marginBottom: 12, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Dev Mode: Mock Login</Text>
        <Text style={{ fontSize: 12 }}>• Admin: admin@test.com</Text>
        <Text style={{ fontSize: 12 }}>• User: user@test.com</Text>
        <Text style={{ fontSize: 12 }}>• Password: any (min 6 chars)</Text>
      </View>

      <Button
        title={isPending ? 'Logging in...' : 'Login'}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
})
