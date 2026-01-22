import { useRegister } from '@/features/auth/api/use-register'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

import { Button, ButtonSpinner, ButtonText } from '@/shared/ui/button'
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/shared/ui/form-control'
import { Heading } from '@/shared/ui/heading'
import { Input, InputField } from '@/shared/ui/input'
import { Text } from '@/shared/ui/text'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    register(data)
  }

  return (
    <View style={styles.container}>
      <Heading size='xl' className='mb-5 text-center font-bold'>
        Create Account
      </Heading>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='firstName'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.firstName} size='md'>
              <FormControlLabel>
                <FormControlLabelText>First Name</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='First Name'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.firstName?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='lastName'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.lastName} size='md'>
              <FormControlLabel>
                <FormControlLabelText>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='Last Name'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.lastName?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.email} size='md'>
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='Enter your email'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize='none'
                  keyboardType='email-address'
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.password} size='md'>
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='Enter your password'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name='confirmPassword'
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.confirmPassword} size='md'>
              <FormControlLabel>
                <FormControlLabelText>Confirm Password</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='Confirm your password'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.confirmPassword?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </View>

      <Button
        className='mt-4 bg-brand-primary'
        onPress={handleSubmit(onSubmit)}
        isDisabled={isPending}
      >
        {isPending && <ButtonSpinner color='white' />}
        <ButtonText>{isPending ? 'Creating Account...' : 'Sign Up'}</ButtonText>
      </Button>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Link href='/(auth)/login' asChild>
          <TouchableOpacity>
            <Text className='text-blue-600 font-bold'>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
})
