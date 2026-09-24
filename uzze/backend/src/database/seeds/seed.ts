import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioTipo, UsuarioStatus } from '../../usuarios/entities/usuario.entity.js';
import 'dotenv/config';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'uzze_user',
    password: process.env.DB_PASSWORD || 'uzze_password',
    database: process.env.DB_DATABASE || 'uzze',
    entities: [Usuario],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const usuarioRepository = dataSource.getRepository(Usuario);

  const existingAdmin = await usuarioRepository.findOne({
    where: { cpf: '000.000.000-00' },
  });

  if (!existingAdmin) {
    const senhaHash = await bcrypt.hash('admin123', 10);
    const admin = usuarioRepository.create({
      nome: 'Administrador',
      cpf: '000.000.000-00',
      email: 'admin@uzze.com',
      senha_hash: senhaHash,
      tipo: UsuarioTipo.ADMIN,
      status: UsuarioStatus.ATIVO,
    });
    await usuarioRepository.save(admin);
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
