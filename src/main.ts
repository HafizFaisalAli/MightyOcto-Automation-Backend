import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('MightyOcto Automation API')
    .setDescription(
      'Phase 3 & 4: Content Marketing Automation + Cost Analysis API',
    )
    .setVersion('1.0')
    .addTag('webhooks', 'Webhook endpoints for form submissions')
    .addTag('calendar', 'Content calendar management')
    .addTag('ai', 'AI content generation')
    .addTag('seo', 'SEO optimization')
    .addTag('publishing', 'Content publishing to blog and social media')
    .addTag('analytics', 'Performance analytics and insights')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 MightyOcto Automation Backend - Phase 3              ║
║                                                            ║
║   Server running on: http://localhost:${port}                ║
║   API Documentation: http://localhost:${port}/api            ║
║   Health Check:      http://localhost:${port}/health         ║
║                                                            ║
║   Status: ✓ Ready for automation                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}

void bootstrap();
