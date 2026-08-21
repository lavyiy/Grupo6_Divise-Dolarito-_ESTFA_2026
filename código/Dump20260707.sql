-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: cotizaciones_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion` (
  `id_cotizacion` int NOT NULL AUTO_INCREMENT,
  `id_moneda` int NOT NULL,
  `precio_compra` decimal(18,2) NOT NULL,
  `precio_venta` decimal(18,2) NOT NULL,
  `tipo_mercado` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cotizacion`),
  KEY `idx_cotizacion_id_moneda` (`id_moneda`),
  KEY `idx_cotizacion_fecha_actualizacion` (`fecha_actualizacion`),
  KEY `idx_cotizacion_moneda_fecha` (`id_moneda`,`fecha_actualizacion`),
  CONSTRAINT `fk_cotizacion_moneda` FOREIGN KEY (`id_moneda`) REFERENCES `moneda` (`id_moneda`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cotizacion`
--

LOCK TABLES `cotizacion` WRITE;
/*!40000 ALTER TABLE `cotizacion` DISABLE KEYS */;
INSERT INTO `cotizacion` VALUES (1,1,1100.00,1130.00,'Blue','2026-06-06 13:00:00'),(2,1,1080.00,1110.00,'Oficial','2026-06-06 13:00:00'),(3,2,1200.00,1250.00,'Oficial','2026-06-06 13:00:00'),(4,3,190.00,210.00,'Oficial','2026-06-06 13:00:00'),(5,4,65000000.00,66000000.00,'Cripto','2026-06-06 13:00:00'),(6,5,1.00,1.00,'Base','2026-06-06 13:00:00'),(7,6,3500000.00,3600000.00,'Cripto','2026-06-06 13:00:00');
/*!40000 ALTER TABLE `cotizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_favorito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_moneda` int NOT NULL,
  `notificacion_activa` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `uq_favorito_usuario_moneda` (`id_usuario`,`id_moneda`),
  KEY `idx_favorito_id_usuario` (`id_usuario`),
  KEY `idx_favorito_id_moneda` (`id_moneda`),
  CONSTRAINT `fk_favorito_moneda` FOREIGN KEY (`id_moneda`) REFERENCES `moneda` (`id_moneda`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
INSERT INTO `favorito` VALUES (1,1,1,1),(2,1,2,0),(3,2,4,1),(4,1,6,1);
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_consulta`
--

DROP TABLE IF EXISTS `historial_consulta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_consulta` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `par_consultado` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_momento` decimal(18,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `idx_historial_id_usuario` (`id_usuario`),
  KEY `idx_historial_fecha` (`fecha`),
  KEY `idx_historial_usuario_fecha` (`id_usuario`,`fecha`),
  CONSTRAINT `fk_historial_consulta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_consulta`
--

LOCK TABLES `historial_consulta` WRITE;
/*!40000 ALTER TABLE `historial_consulta` DISABLE KEYS */;
INSERT INTO `historial_consulta` VALUES (1,1,'USD/ARS',1130.00,'2026-06-06 13:15:00'),(2,1,'EUR/ARS',1250.00,'2026-06-06 13:20:00'),(3,2,'BTC/ARS',66000000.00,'2026-06-06 13:30:00'),(4,1,'ETH/ARS',3600000.00,'2026-06-06 13:35:00');
/*!40000 ALTER TABLE `historial_consulta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moneda`
--

DROP TABLE IF EXISTS `moneda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moneda` (
  `id_moneda` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_moneda`),
  UNIQUE KEY `uq_moneda_codigo` (`codigo`),
  KEY `idx_moneda_tipo` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moneda`
--

LOCK TABLES `moneda` WRITE;
/*!40000 ALTER TABLE `moneda` DISABLE KEYS */;
INSERT INTO `moneda` VALUES (1,'USD','Dolar estadounidense','Fiat'),(2,'EUR','Euro','Fiat'),(3,'BRL','Real brasileno','Fiat'),(4,'BTC','Bitcoin','Cripto'),(5,'ARS','Peso argentino','Fiat'),(6,'ETH','Ethereum','Cripto');
/*!40000 ALTER TABLE `moneda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moneda_base_id` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuarios_email` (`email`),
  KEY `idx_usuarios_moneda_base_id` (`moneda_base_id`),
  CONSTRAINT `fk_usuarios_moneda_base` FOREIGN KEY (`moneda_base_id`) REFERENCES `moneda` (`id_moneda`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Lorenzo Sanchez','lorenzo@email.com','lorenzo2019',5),(2,'Martina Gomez','martina@email.com','martina2020',2);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 11:32:22
