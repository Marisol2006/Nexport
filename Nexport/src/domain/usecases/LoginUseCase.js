
export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(email, password) {
    if (!email || !password) {
      throw new Error('Ingresa tu correo y contraseña');
    }

    return await this.authRepository.login(
      email.trim(),
      password
    );
  }
}
