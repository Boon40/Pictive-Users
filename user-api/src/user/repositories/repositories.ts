import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/models';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
