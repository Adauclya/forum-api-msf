import RegisterUser from '../../Domains/users/entities/RegisterUser.js';
import RegisteredUser from '../../Domains/users/entities/RegisteredUser.js';


class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload);
    await this._userRepository.verifyAvailableUsername(registerUser.username);
    registerUser.password = await this._passwordHash.hash(registerUser.password);
    return this._userRepository.addUser(registerUser).then((userData) => new RegisteredUser({
      id: userData.id,
      username: userData.username,
      fullname: userData.fullname,
    }));

  }
}

export default AddUserUseCase;
