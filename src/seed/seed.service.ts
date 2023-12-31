import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { BcryptAdapter } from 'src/auth/adapter/bcrypt.adapter';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {
    bcryptAdapter = new BcryptAdapter();
  }

  async runSeed() {
    await this.deletTables();
    const adminUser = await this.insertUsers();
    const seedResp = await this.insertNewProducts(adminUser);
    return seedResp;
  }

  private async deletTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    await seedUsers.forEach(async (user) => {
      user.password = await this.bcryptAdapter.hashing(user.password, 10);
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];
    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    const resp = await Promise.all(insertPromises);

    return resp;
  }
}
