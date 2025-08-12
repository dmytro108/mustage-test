import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable graceful shutdown
	//some update to test PR
	app.enableShutdownHooks();

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
