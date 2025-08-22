-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 34.88.69.135
-- Generation Time: Aug 22, 2025 at 12:09 PM
-- Server version: 8.0.37-google
-- PHP Version: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fitq_live_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `trainer_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(19,4) UNSIGNED NOT NULL,
  `discounted_price` decimal(19,4) UNSIGNED DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_use_count` int UNSIGNED NOT NULL DEFAULT '1',
  `expires_in_days` int UNSIGNED NOT NULL DEFAULT '0',
  `contract_length_in_months` tinyint UNSIGNED DEFAULT NULL,
  `program_id` bigint UNSIGNED DEFAULT NULL,
  `trainer_ticket_category_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `trainer_id`, `name`, `description`, `type`, `price`, `discounted_price`, `currency`, `max_use_count`, `expires_in_days`, `contract_length_in_months`, `program_id`, `trainer_ticket_category_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4898, 'FitQ', 'Uus hingamine', 'TRAINER_TICKET', '0.0200', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-09-13 12:28:09', '2022-09-13 12:31:55', '2022-09-13 12:31:55'),
(2, 4503, 'testuus3', 'jou', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-09-13 12:35:30', '2022-09-13 12:35:30', NULL),
(3, 3989, 'Jõusaali ringtreening 1x pääse', '1x ringtreeningu pääse Pärnu Sisejulgeolekumaja töötajatele', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-09-14 16:25:21', '2023-08-24 12:22:16', '2023-08-24 12:22:16'),
(4, 4918, '1X pääse tervendustrenni \"Voolav loov liikumine\"', 'Trenn loob sulle tervema, särava, õnnelikuma keha. Alustame loovliikumisega üle saali, põhiosas teeme matil erinevad tervendusharjutusi, sellele järgnevad venitus-, hingamiseharjutused ja lõpetame meditatsiooniga. Oled südamest trenni oodatud, armas hing!', 'TRAINER_TICKET', '10.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-09-26 14:24:16', '2022-12-27 14:19:06', '2022-12-27 14:19:06'),
(5, 201, 'Poksi eratreening 1x', '60 min', 'TRAINER_TICKET', '20.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-11-12 15:05:58', '2022-11-12 15:05:58', NULL),
(6, 4918, '1X pääse tervendustrenni \"Voolav loov liikumine\"', 'Trenn loob sulle tervema, särava, õnnelikuma ja paindlikuma keha. Alustame rahulike dünaamiliste venitusharjutustega, matil erinevad liikuvus, tervendus ja hingamiseharjutused ja lõpetan meditatsiooniga. Oled südamest trenni oodatud!', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-12-27 14:05:53', '2023-01-06 14:28:30', '2023-01-06 14:28:30'),
(7, 4918, 'Elustiilitreening', 'Mentorlus on mõeldud sulle, kui sa tunned, et oled oma tervise mureda üksi ja ei tea kust alustada. Mina anna sulle treenerina suuna, et liiguksime parema tervise suunas.  Annan tervikteenust : vaimse, füüsilise ja hingelise tervise kohta!  - 60 min', 'TRAINER_TICKET', '60.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2022-12-27 14:13:38', '2023-01-03 11:10:43', '2023-01-03 11:10:43'),
(8, 4918, '1X pääse tervendustrenni \"Voolav loov liikumine\"', 'PROOVITRENN ON  TASUTA :)', 'TRAINER_TICKET', '0.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-01-03 11:27:49', '2023-01-03 11:33:19', '2023-01-03 11:33:19'),
(9, 4918, '1X pääse tervendustrenni \"Voolav loov liikumine\"', 'TASUTA PROOVITRENN', 'TRAINER_TICKET', '0.1000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-01-03 11:34:11', '2023-01-03 11:55:08', '2023-01-03 11:55:08'),
(10, 4409, 'proov', ':)', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-01-04 10:13:22', '2023-04-02 18:56:35', '2023-04-02 18:56:35'),
(11, 18, 'Treeningkava koostamine 1 kuu', 'Koostan sulle kuu ajase treeningplaani, ning jälgime koos selle täitmist', 'TRAINER_TICKET', '50.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2023-01-31 15:29:18', '2023-09-28 06:54:47', NULL),
(12, 18, 'Personaaltreening', 'Teeme koos sinuga mõlemale sobival ajal ühe personaaltreeningu', 'TRAINER_TICKET', '30.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2023-01-31 15:29:49', '2023-09-28 06:54:39', NULL),
(13, 3989, 'Intuitiivse toitumise loeng 10.03', 'Ühekordne osaluspanus, et osaleda loengus, mis toimub 10.03 algusega kell 13.00', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-02-10 10:54:44', '2023-03-13 20:44:28', '2023-03-13 20:44:28'),
(14, 3989, 'Personaaltreening 2x', '2 personaaltreeningut, mis toimuvad Pärnus 24/7Fitness spordiklubis', 'TRAINER_TICKET', '75.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-02-14 12:01:04', '2023-02-27 13:24:41', '2023-02-27 13:24:41'),
(15, 3989, 'Personaaltreening 1x', 'Personaaltreening toimub Pärnus 24/7Fitness spordiklubis.', 'TRAINER_TICKET', '35.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-02-15 13:33:22', '2023-02-27 19:22:05', '2023-02-27 19:22:05'),
(16, 3989, 'Online coaching', 'Kuutasu', 'TRAINER_TICKET', '15.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-02-27 13:19:17', '2023-02-27 19:22:02', '2023-02-27 19:22:02'),
(17, 6387, '3 kuu treening- ja toitumiskava', 'Vastavalt sinu eelistatavale treeningule ning treeningeesmärkidega kooskõlas olev progresseeruv treeningkava ning vastavalt tulemustele uuendatud toitumiskava \nPisteline tulemuste kontroll 1x nädalas + jooksev nõustamine.', 'TRAINER_TICKET', '40.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2023-03-15 22:32:19', '2023-09-28 06:59:27', NULL),
(18, 6387, 'Personaaltreening (1 ühik)', 'Kokkuleppeline personaaltreening Sinu kodus/õues 24/7Fitness jõusaalis (lisandub jõusaali paketitasu, täpselt sellises koguses nagu sul tarvis, aitamaks sul lihvida treeningtehnikat ning seeläbi edukamalt järgida eelkoostatud treeningplaani.', 'TRAINER_TICKET', '30.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2023-03-15 22:37:18', '2023-09-28 06:59:05', NULL),
(19, 4409, 'Poksi eratreening', 'Poksieratreening 60 minutit Tartu Ülikooli Akadeemilises Spordiklubis', 'TRAINER_TICKET', '25.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-04-02 18:57:28', '2023-04-11 09:53:43', '2023-04-11 09:53:43'),
(20, 4409, 'Poksi eratreening 1x', 'Poksi eratreening 60 minutit Tartu Ülikooli Akadeemilises Spordiklubis.', 'TRAINER_TICKET', '25.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2023-04-11 09:54:18', '2024-06-06 17:57:00', '2024-06-06 17:57:00'),
(21, 6402, 'Personaal treening', 'Kestvus 60min. Aeg ja koht kokkuleppel', 'TRAINER_TICKET', '25.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2023-06-24 17:04:51', '2023-09-28 07:00:37', NULL),
(22, 4409, '4x poksi eratreening 60 min', '4 poksi eratreeningut kokku lepitud ajal. Ühe trenni kestus 60 min.', 'TRAINER_TICKET', '70.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-07-04 12:12:36', '2023-08-24 12:44:22', '2023-08-24 12:44:22'),
(23, 126, 'Fit with Kristi', 'Kristi Möldri 4-nädalane treeningprogramm, kust leiad trenne lihastreeningutest lõbusate tantsutrennideni', 'PROGRAM', '24.9900', NULL, 'EUR', 1, 365, NULL, 11, NULL, '2023-07-07 13:14:04', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(24, 4385, 'Personaalne nõustamine', 'Annan nõu kuidas saavutada hea füüsiline vorm kiire elutempo juures.\nIgapäevased lihtsad nipid mis aitavad minul head vormi hoida.', 'TRAINER_TICKET', '15.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-08-04 09:39:25', '2023-08-04 09:39:25', NULL),
(25, 1869, 'Joogaampsud', '21-päevane programm, kust leiad iga päev mõnusa lühikese joogaampsu, millega enda keha üles äratada.', 'PROGRAM', '30.0000', NULL, 'EUR', 1, 365, NULL, 13, NULL, '2023-08-17 15:55:40', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(26, 4898, 'Tänane uus pilet', 'fsakfmsdf', 'TRAINER_TICKET', '2.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-08-21 07:14:48', '2023-08-21 07:16:51', '2023-08-21 07:16:51'),
(27, 8503, 'Jooksmise üldkehaline ettevalmistus Tartus', 'Trenn sisaldab nii jooksutehnika harjutusi kui ka keharaskusega jõuharjutusi. Trennid toimuvad Tartu Laululaval neljapäeviti kell 18:00. Soovitav on trennile ette joosta 20-30 min. Kaasa Joogipudel ja matt! (võta matt ise, aga kui pole, saab juhendajalt).', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-08-21 11:44:28', '2023-09-28 07:02:07', NULL),
(28, 8503, 'Jooksmise üldkehaline ettevalmistus Annikoru', 'Trenn sisaldab tehnika- ja keharaskusega jõuharjutusi. Trennid toimuvad Konguta kooli saalis teisipäeviti kell 18:00. Soovitav on enne trenni joosta 20-30 min. Kaasa juua ja matt! (kui matti pole, saab juhendajalt).\nNB! kaasa vahetusjalatsid', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-08-21 11:48:17', '2023-11-06 14:05:41', NULL),
(29, 4898, 'aa', 'ss', 'TRAINER_TICKET', '22.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-08-21 12:30:53', '2023-08-21 12:33:51', '2023-08-21 12:33:51'),
(30, 4898, 'Test', 'Testime siis maksmist', 'TRAINER_TICKET', '1.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-08-21 15:38:05', '2023-08-21 15:40:23', '2023-08-21 15:40:23'),
(31, 3989, 'Jõusaali ringtreening 1x pääse', 'Pärnu Sisejulgeolekumaja töötajatele', 'TRAINER_TICKET', '8.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-08-24 11:46:38', '2023-09-28 06:47:07', NULL),
(32, 7085, 'Personaaltreening 1x pääse', 'Personaaltreening Viljandi Leola jõusaalis 60min.', 'TRAINER_TICKET', '30.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2023-09-05 07:27:34', '2023-09-28 06:51:49', NULL),
(33, 73, 'Jooksutreening', 'Jooksme koos', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-09-05 19:00:10', '2023-09-05 19:00:25', '2023-09-05 19:00:25'),
(34, 4409, 'proov', 'ddsfdsf', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-09-06 08:23:52', '2023-09-06 08:23:58', '2023-09-06 08:23:58'),
(35, 4898, 'Niisama pilet', 'See on mõeldud testimiseks', 'TRAINER_TICKET', '1.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-09-15 08:49:35', '2023-09-15 08:49:35', NULL),
(36, 101, 'proov', 'sds', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2023-09-29 10:27:15', '2023-10-16 13:11:00', '2023-10-16 13:11:00'),
(37, 9042, 'Seljakooli kuutellimus', 'Tellimus uueneb automaatselt iga kuu.', 'TRAINER_SUBSCRIPTION', '7.9900', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-10-09 13:28:00', '2024-02-09 08:02:35', NULL),
(38, 9118, 'Tallinna ühistrenn. Üldkehaline ettevalmistus jooksmiseks', 'Üldkehaline ettevalmistus jooksmiseks sisaldab nii jooksutehnika harjutusi kui ka oma keharaskusega jõuharjutusi.', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-10-09 13:02:55', '2023-10-09 13:14:53', NULL),
(39, 9118, 'Tartu ühistrenn. Üldkehaline ettevalmistus jooksmiseks', 'Üldkehaline ettevalmistus jooksmiseks sisaldab nii jooksutehnika harjutusi kui ka oma keharaskusega jõuharjutusi.', 'TRAINER_TICKET', '7.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-10-09 13:14:45', '2023-10-09 13:14:45', NULL),
(40, 9042, 'Personaalne nõustamine 30 min', 'Iga inimene on eriline. Seepärast on ka tervislike harjumuste loomine ja järjepidevuse hoidmine igaühele erinev väljakutse. Aitan sind meeleldi personaalse nõu ja abiga. Nõustamine toimub interneti vahendusel ja on väljakutses osalejatele soodushinnaga.', 'TRAINER_TICKET', '25.0000', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2023-10-11 08:22:51', '2023-10-11 08:22:51', NULL),
(41, 8998, 'Hopa Beebi treeningprogramm rasedatele', 'Treeningprogramm sisaldab treeningvideoid, harjutusi, toitumissoovitusi ja nõuandeid kogu raseduse perioodiks. Lisaks käsiraamat koos toitumissoovitustega (64 lk).', 'PROGRAM', '99.0000', NULL, 'EUR', 1, 0, NULL, 18, NULL, '2023-10-19 18:15:34', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(42, 4409, 'proov', ':)', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2023-10-25 08:44:45', '2023-10-25 08:46:37', '2023-10-25 08:46:37'),
(43, 4409, 'proov', ':)', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2023-10-25 09:00:58', '2023-10-25 09:03:01', '2023-10-25 09:03:01'),
(44, 120, 'Pilatesega vormi', 'Selles programmis parandad enda vormi ning õpid baasteadmisi pilatesest!', 'PROGRAM', '129.0000', NULL, 'EUR', 1, 365, NULL, 5, NULL, '2023-10-31 13:14:04', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(45, 4407, 'personaalne nõustamine 30 min', 'Annan nõu harjutuste sooritamise, tehnika ja korduste arvu kohta! Samuti on võimalik saada juurde uusi harjutusi, mis viiksid paremate tulemusteni!', 'TRAINER_TICKET', '25.0000', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2023-11-05 16:11:32', '2023-11-05 16:11:32', NULL),
(46, 4409, 'Poksitrenn Vara koolile (näidis)', 'Poksitreening 2x90 minutit.', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-11-06 12:42:45', '2023-11-14 10:41:34', '2023-11-14 10:41:34'),
(47, 4409, 'Tutvustav poksitreening Vara noortele', 'Poksitreening 2x90 min.', 'TRAINER_TICKET', '80.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2023-11-14 10:43:17', '2024-02-26 12:43:08', '2024-02-26 12:43:08'),
(48, 4898, 'Kuutellimus', 'Tellimus uueneb automaatselt iga kuu.\r\n\r\n\r\n\r\n\r\n\r\n', 'TRAINER_SUBSCRIPTION', '33.0000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2023-12-13 13:28:28', '2023-12-13 13:28:28', NULL),
(49, 4918, 'Tasakaalustav jõutrenn', 'Rühmatreening:  meestele ja naistele \n  Aeg : neljapäeviti 9-10. \n  Aadress : Õhtu põik 3-20 Pärnus. \n\n  Registreerimine : https://www.jannetantsustuudio.ee/kalender', 'TRAINER_TICKET', '8.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-01-23 08:05:26', '2024-01-23 08:16:23', NULL),
(50, 4918, 'Elustiilitreening (täiskasvanutele)', 'Treener õpetab sulle, et saaksid enda elu meistriks. Sa liigud treeningul aste-astmelt lähemale oma unistuste elule ja ühtlasi saavutad ka hea tervise ja parima elu.', 'TRAINER_TICKET', '50.0000', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2024-01-23 08:14:15', '2024-01-23 08:14:15', NULL),
(51, 4918, 'Elustiilitreening (õpilastele)', 'Treener õpetab sulle, et saaksid enda elu meistriks. Sa liigud treeningul aste-astmelt lähemale oma unistuste elule ja ühtlasi saavutad ka hea tervise ja parima elu.', 'TRAINER_TICKET', '40.0000', NULL, 'EUR', 1, 0, NULL, NULL, 1, '2024-01-23 08:15:51', '2024-01-23 08:39:21', NULL),
(52, 73, 'Testtreening', '', 'TRAINER_TICKET', '0.0100', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-01-23 10:11:22', '2024-01-23 10:11:22', NULL),
(53, 10057, 'Jõusaali ringtreening', 'Osalus jõusaali ringtreeningus, kestvus 55 min', 'TRAINER_TICKET', '8.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-01-23 11:53:21', '2024-01-24 08:35:42', NULL),
(54, 10088, 'Jõusaali ringtreening 1x pääse', 'Pärnu Sisejulgeolekumaja töötajatele', 'TRAINER_TICKET', '8.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-01-23 13:26:35', '2024-01-23 13:26:35', NULL),
(55, 9042, 'Seljakooli trenniampsud', 'Seljakooli trenniampsud', 'PROGRAM', '29.9000', NULL, 'EUR', 1, 365, NULL, 23, NULL, '2024-02-09 08:06:58', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(56, 8998, 'Hopa Beebi treeningprogramm rasedatele', 'Treeningprogramm sisaldab treeningvideoid, harjutusi, toitumissoovitusi ja nõuandeid kogu raseduse perioodiks. Lisaks käsiraamat koos toitumissoovitustega (64 lk).', 'TRAINER_SUBSCRIPTION', '14.9000', NULL, 'EUR', 1, 0, NULL, 18, NULL, '2024-02-13 10:58:49', '2024-02-13 10:58:49', NULL),
(57, 126, 'Kristi Möldri kuutellimus', 'Kristi Möldri kuutellimus, millega saad ligi tema loodud videotreeningutele ja treeningprogrammidele', 'TRAINER_SUBSCRIPTION', '9.9000', NULL, 'EUR', 1, 0, NULL, NULL, NULL, '2024-02-13 16:48:00', '2024-02-13 16:51:30', NULL),
(58, 8764, 'Vaagnapõhjalihaste treeningkursus', '8-nädalane animeeritud videojuhistega kava naistele, keda kõnetab vaagnapõhja teema ja kellel on huvi vaagnapõhjalihaste treenimise vastu', 'PROGRAM', '95.0000', NULL, 'EUR', 1, 365, NULL, 17, NULL, '2024-02-28 13:16:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(59, 101, 'FitQ Premium', 'FitQ Premium pakett. Ligipääs FitQ kanali videotele ja FitQ loodud programmidele ja väljakutsetele', 'TRAINER_SUBSCRIPTION_PREMIUM', '14.9900', NULL, 'EUR', 0, 30, NULL, NULL, NULL, '2024-02-29 14:58:00', '2024-03-31 18:20:16', NULL),
(60, 101, 'FitQ Premium aastapakett', 'FitQ Premium aastapakett', 'TRAINER_SUBSCRIPTION_PREMIUM', '149.9000', NULL, 'EUR', 0, 365, NULL, NULL, NULL, '2024-02-29 14:59:19', '2024-02-29 14:59:19', NULL),
(61, 101, 'FitQ Premium 24-kuu leping', 'FitQ Premium 24-kuu leping. 24-kuuse lepinguga lisame kingitusena 100 € treeningvarustust.', 'TRAINER_SUBSCRIPTION_PREMIUM', '14.9900', NULL, 'EUR', 0, 30, 24, NULL, NULL, '2024-02-29 15:00:00', '2024-03-09 12:03:29', NULL),
(62, 101, 'FitQ Gold', 'FitQ Kuldpakett sisaldab lisaks Premium paketi sisule ka ligipääsu Geneto toitumisäpile', 'TRAINER_SUBSCRIPTION_GOLD', '29.9900', '24.9900', 'EUR', 0, 30, NULL, NULL, NULL, '2024-02-29 15:11:00', '2024-05-24 05:31:59', NULL),
(63, 101, 'FitQ Gold aastapakett', 'FitQ Kuldpakett sisaldab lisaks Premium paketi sisule ka ligipääsu Geneto toitumisäpile', 'TRAINER_SUBSCRIPTION_GOLD', '299.9000', '249.9000', 'EUR', 0, 365, NULL, NULL, NULL, '2024-02-29 15:11:00', '2024-05-24 05:32:39', NULL),
(64, 101, 'FitQ Gold 24-kuu leping', 'FitQ Kuldpaketi 24-kuulisele lepingule lisame kingitusena 200 € FitQ e-poe krediiti.', 'TRAINER_SUBSCRIPTION_GOLD', '29.9900', '24.9900', 'EUR', 0, 30, 24, NULL, NULL, '2024-02-29 15:13:00', '2025-03-25 09:42:49', NULL),
(65, 101, 'FitQ Platinum', 'FitQ Platinum pakett sisaldab kõiki FitQ Premiumi kasutamise võimalusi ning lisaks isiklikku treeningkava', 'TRAINER_SUBSCRIPTION_PLATINUM', '149.9900', NULL, 'EUR', 0, 90, 3, NULL, NULL, '2024-02-29 15:15:00', '2024-11-14 07:13:26', NULL),
(66, 10088, '1xPersonaaltreening', 'Pilet sisaldab 1x personaaltreeningut 24/7 Fitness Pärnu klubis', 'TRAINER_TICKET', '35.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-03-16 19:48:48', '2024-03-16 19:48:48', NULL),
(67, 9562, 'From Zero to Hero', 'From Zero to Hero programmi tasu', 'PROGRAM', '44.0000', NULL, 'EUR', 0, 365, NULL, 24, NULL, '2024-04-05 13:34:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(68, 9562, 'Helina Kalda kuutellimus', 'Helina Kalda kuutellimus', 'TRAINER_SUBSCRIPTION', '14.9000', NULL, 'EUR', 0, 0, NULL, NULL, NULL, '2024-04-05 13:37:36', '2024-04-05 13:37:36', NULL),
(69, 101, 'Vinyasa jooga Gina Bergmanniga', '10 vinyasa jooga trenni Eesti ühe parima vinyasa treeneri Gina Bergmanniga', 'PROGRAM', '14.9900', NULL, 'EUR', 0, 0, NULL, 25, NULL, '2024-04-16 07:01:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(70, 101, 'FitQ Kodu-olümpia 2024', 'Liitu FitQ kodu-olümpia programmiga, kus olümpiale pääs on jõukohane igaühele. Menüüsse oleme pannud 28 treeningut 7 erinevalt treenerilt.', 'PROGRAM', '35.0000', NULL, 'EUR', 0, 90, NULL, 26, NULL, '2024-04-17 10:25:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(71, 4903, 'Online', 'https://meet.google.com/avr-nsna-uiv', 'TRAINER_TICKET', '1.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-04-18 13:09:52', '2024-04-18 13:13:28', '2024-04-18 13:13:28'),
(72, 10579, '4. Naissaare Elamusmaraton 21 km', '4. Naissaare Elamusmaratoni osalustasu 21 km distants koos praamipiletiga.\n2. juuni 2024. Lisainfo: https://elamusmaratonid.ee/elamusmaratonid/4-naissaare-elamusmaraton', 'TRAINER_TICKET', '53.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:02:23', '2024-05-09 10:55:42', NULL),
(73, 10579, '4. Naissaare Elamusmaraton 10 km', '4. Naissaare Elamusmaraton 10 km distantsi osalustasu koos praamipiletiga.\n2. juuni 2024. Lisainfo: https://elamusmaratonid.ee/elamusmaratonid/4-naissaare-elamusmaraton', 'TRAINER_TICKET', '43.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:03:41', '2024-05-09 10:55:33', NULL),
(74, 10579, '4. Naissaare Elamusmaratoni praamipilet', 'Kui soovid korraldajatelt osta ka praamipiletit, siis saad seda samuti siit lehelt\nhttps://elamusmaratonid.ee/elamusmaratonid/4-naissaare-elamusmaraton', 'TRAINER_TICKET', '22.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-04-26 19:05:12', '2024-04-26 19:05:30', '2024-04-26 19:05:30'),
(75, 10579, '6. Kõrvemaa Elamusmaraton 42 km', '6. Kõrvemaa Elamusmaraton 42 km osalustasu.\n14. juuli 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/6-korvemaa-elamusmaraton', 'TRAINER_TICKET', '36.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:09:02', '2024-05-09 10:55:22', NULL),
(76, 10579, '6. Kõrvemaa Elamusmaraton 21 km', '6. Kõrvemaa Elamusmaratoni 21 km distantsi osalustasu\n14. juuli 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/6-korvemaa-elamusmaraton', 'TRAINER_TICKET', '31.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:13:23', '2024-05-09 10:55:14', NULL),
(77, 10579, '6. Kõrvemaa Elamusmaraton 10 km', '6. Kõrvemaa Elamusmaratoni 10 km distantsi osalustasu\n14. juuli 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/6-korvemaa-elamusmaraton', 'TRAINER_TICKET', '21.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:14:08', '2024-05-09 10:55:06', NULL),
(78, 10579, '16. Lahemaa Elamusmaratoni 42 km', '16. Lahemaa Elamusmaratoni 42 km distantsi osalustasu\n11. august 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/16-lahemaa-elamusmaraton', 'TRAINER_TICKET', '36.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:15:38', '2024-05-09 10:54:13', NULL),
(79, 10579, '16. Lahemaa Elamusmaratoni 21 km', '16. Lahemaa Elamusmaratoni 21 km distantsi osalustasu\n11. august 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/16-lahemaa-elamusmaraton', 'TRAINER_TICKET', '31.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:16:14', '2024-05-09 10:53:41', NULL),
(80, 10579, '16. Lahemaa Elamusmaratoni 10 km', '16. Lahemaa Elamusmaratoni 10 km osalustasu\n11. august 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/16-lahemaa-elamusmaraton', 'TRAINER_TICKET', '21.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:16:56', '2024-05-09 10:53:31', NULL),
(81, 10579, '12. Noarootsi Elamusmaraton 42 km', '12. Noarootsi Elamusmaratoni 42 km distantsi osalustasu\n1. september 2024', 'TRAINER_TICKET', '36.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:18:21', '2024-05-09 10:53:18', NULL),
(82, 10579, '12. Noarootsi Elamusmaraton 21 km', '12. Noarootsi Elamusmaratoni 21 km distantsi osalustasu\n1. september 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/12-noarootsi-elamusmaraton', 'TRAINER_TICKET', '31.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:19:13', '2024-05-09 10:53:02', NULL),
(83, 10579, '12. Noarootsi Elamusmaraton 10 km', '12. Noarootsi Elamusmaratoni 10 km distantsi osalustasu\n1. september 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/12-noarootsi-elamusmaraton', 'TRAINER_TICKET', '21.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:20:13', '2024-05-09 10:52:44', NULL),
(84, 10579, '5. Alutaguse Elamusmaratoni 21 km', '5. Alutaguse Elamusmaratoni 21 km distantsi osalustasu\n22. september 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/5-alutaguse-elamusmaraton', 'TRAINER_TICKET', '31.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:48:42', '2024-05-09 10:52:26', NULL),
(85, 10579, '5. Alutaguse Elamusmaratoni 10 km', '5. Alutaguse Elamusmaratoni 10 km distantsi osalustasu\n22. september 2024\nLisainfo: https://elamusmaratonid.ee/elamusmaratonid/5-alutaguse-elamusmaraton', 'TRAINER_TICKET', '21.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-04-26 19:49:20', '2024-05-09 10:51:57', NULL),
(86, 4409, 'Poksitehnika algajale', '18-päevane poksitehnika õppimisele suunatud programm varasema kogemuseta poksihuvilisele. Lisaks löökide õppimisele keskendume ka jalgade tööle ning kaitsetehnikale.', 'PROGRAM', '11.9900', NULL, 'EUR', 0, 365, NULL, 28, NULL, '2024-05-29 19:52:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(87, 10651, 'Viljandis jooksu- ja jõutreening', 'Reede 31.05.24 Viljandi Paala kooli Viilhallis treening. 1h õues jooks ja ca 50min sees jooksuharjutused + jooksu toetavad jõuharjutused. Pesemistingimused ja riietusruumid kohapeal olemas!', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-05-30 17:05:04', '2024-06-05 12:05:29', '2024-06-05 12:05:29'),
(88, 10651, 'Jooksutreening esmaspäeviti Viljandis', 'Tavaliselt algusega Männimäe lasteaja parklast kell 18.30 ca 1h 20min jooksutreening kus teeme ühiselt soojendusjooksu ning jooksuharjutused ning igaühe individuaalsetest kiirustest lähtuvalt kiirustreeningu otsa. Lõpus veidi jõudu ja venitusi', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-05-30 17:06:49', '2024-05-30 17:08:24', NULL),
(89, 10651, 'Jooksu toetav jõutreening Viljandis', 'Tavaliselt kolmapäeviti kell 18.30 Viljandi Männimäe Staadionil või Linnastaadionil (suhtleme asukoha üle). Treeningu pikkus ca 1h 20min. Soojendusjooksu järel teeme erinevaid ÜKE harjutusi, TRX, treppidest jooksu, asteid jm', 'TRAINER_TICKET', '5.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-05-30 17:08:10', '2024-05-30 17:08:45', NULL),
(90, 101, '4 kuine jooksukursus algajatele', '4 kuuga nullist kuni 10 km jooksuni. Kursuse on koostanud ülikogenud jooksutreener Margus Pirksaar.', 'PROGRAM', '49.9900', NULL, 'EUR', 0, 0, 12, 19, NULL, '2024-06-04 05:23:00', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(91, 101, '4 kuine jooksukursus poolmaratoniks valmistujatele', 'Ettevalmistuskursus poolmaratoniks. Kursuse on kokku pannud ülikogenud jooksutreener Margus Pirksaar', 'PROGRAM', '49.9900', NULL, 'EUR', 0, 0, 12, 27, NULL, '2024-06-04 05:24:29', '2024-10-08 07:35:21', '2024-10-08 07:35:21'),
(92, 4898, 'Testing', '<p>sadas<a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://app.fitq.me/et/pricing\">das</a></p>', 'TRAINER_PROGRAM', '22.5000', NULL, 'EUR', 1, 365, NULL, 2, NULL, '2024-06-04 07:01:47', '2024-08-29 11:25:12', NULL),
(93, 10651, 'Individuaalne jooksukava üheks kuuks', 'Sõltuvalt eesmärgist koostan Sulle üheks kuuks individuaalse jooksukava, mis aitab jõuda püstitatud eesmärkideni: nt 5, 10km, PM, maraton või varasema tulemuse parandamine.', 'TRAINER_TICKET', '50.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2024-06-05 12:13:39', '2024-06-05 12:13:39', NULL),
(94, 10651, 'Naiste treening Viljandis 16.06 kl 18.00 Männimäe Jakobsoni kooli staadionil', 'Naiste treening!\nTreenime kõiki lihaseid, mis naistele olulised: rinna-, kere süvalihased, reie ja tuhara ning tupelihased, mis mõjutavad nii Sinu kui Su partneri heaolu. \nTreeningul erinevad jõu-, jooga ja hingamisharjutused.\nKaasa matt ja veepudel.', 'TRAINER_TICKET', '15.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2024-06-11 10:01:21', '2024-06-11 10:01:21', NULL),
(95, 10651, 'Jooksu- ja investeerimislaager Jõulumäel 19-21.07.24', 'Laagri maksumus sisaldab kõiki trenne, vestlus- ja saunaõhtut, investeerimiskoolitust, ööbimist spordikompleksis 2 ööd ja kõiki toidukordi. Treenerid Inga Kree ja Einar Kaigas ning investeerimisest rääkimas Mulgi Rahatarkuse eestvedaja Marek Naaris', 'TRAINER_TICKET', '165.0000', NULL, 'EUR', 1, 0, NULL, NULL, 6, '2024-06-11 10:06:36', '2024-06-11 10:06:36', NULL),
(96, 73, 'Paranda oma liikuvust', '30-päevane treeningprogramm, mis aitab parandada sul liikuvust', 'TRAINER_PROGRAM', '9.9900', NULL, 'EUR', 1, 365, NULL, 3, NULL, '2024-06-26 19:30:26', '2024-06-26 19:30:26', NULL),
(97, 73, '165: 33 päevane restart kogu kehale', '33 päevane väljakutse, millega annad oma vormile täieliku restardi.', 'TRAINER_PROGRAM', '19.9900', NULL, 'EUR', 1, 365, NULL, 4, NULL, '2024-07-26 14:29:39', '2024-07-30 11:57:17', NULL),
(98, 73, '175: 33 päevane restart kogu kehale', 'Tuleb trenni teha', 'TRAINER_PROGRAM', '19.9900', NULL, 'EUR', 1, 365, NULL, 5, NULL, '2024-07-30 12:02:49', '2025-04-01 08:28:45', NULL),
(99, 101, 'FitQ Premium 2-aastane leping kvartalimaksega (Stebby toode)', 'FitQ Premium 2-aastane leping kvartalimaksega. Toode müügil ainult Stebby platvormil lepinguna.', 'TRAINER_SUBSCRIPTION_STEBBY', '44.9900', NULL, 'EUR', 0, 730, NULL, NULL, NULL, '2024-08-26 12:40:00', '2024-08-26 12:43:42', NULL),
(100, 101, 'FIT360', 'FIT360 on 5 erineva treeneriga mitmekesine treeningprogram. Kõigile FitQ paketi omanikele tasuta!', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 6, NULL, '2023-03-21 15:51:21', '2024-08-27 19:29:01', NULL),
(101, 101, 'Järjepidevus', '<p>Järjepidevus on meie kõige efektiivseim treeningprogramm! Kõigest 15 minutiga päevas paremasse vormi. Kiired ja intensiivsed treeningud Eesti parimate treeneritega.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 7, NULL, '2023-03-15 18:26:49', '2025-03-13 06:24:08', NULL),
(102, 101, 'Trennisõbrad', '<p>Treeningprogramm Trennisõbrad on 15 minutilised intensiivsed treeningud, mis toovad tulemusi ja mahuvad iga trennisõbra päevaplaani.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 8, NULL, '2023-03-21 15:51:21', '2024-08-27 19:39:06', NULL),
(103, 101, 'Elustiili muutus', '<p>Treeningprogrammi eesmärgiks on luua inimesele tervislikke harjumusi, mis on ka jätkusuutlikud. Lisaks treeningkavale saavad liitujad ka toitumissoovitusi ja loengu tervisliku toitumise kohta.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 9, NULL, '2023-04-04 13:42:25', '2024-08-27 19:44:30', NULL),
(104, 101, 'Suveks vormi', '<p>Treeningprogrammi eesmärk on langetada talvekilod ja jõuda suveks enda elu parimasse vormi. Etteantud päevased ülesanded ja toitumissoovitused toetavad sinu tervislikumat elustiili.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 10, NULL, '2023-06-13 15:51:04', '2024-08-27 20:04:58', NULL),
(105, 101, 'Töökohaspordikuu', '<p>Töökohaspordi Q treeningprogramm ärgitab osalejaid rohkem liikuma ja olema tervislikumad. Muuda füüsiline aktiivsus enda jaoks huvitavaks ja mänguliseks!</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 11, NULL, '2023-06-13 15:51:04', '2024-08-27 20:27:43', NULL),
(106, 101, 'Tugev selg', '<p>Tugev selg on treeningprogramm, mille eesmärk on ennetada ning leevendada alaseljavalusid. Meie uus treeningprogramm on keskendunud seljalihaste tugevdamisele ja taastamisele.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 12, NULL, '2023-06-26 17:14:02', '2024-08-27 20:33:11', NULL),
(107, 101, 'Alustav treenija', '<p>Programm pakub mitmekülgseid treeninguid FitQ populaarsetelt treeneritelt, kelle juhendamisel parandad enda füüsilist vormi ning enesetunnet.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 13, NULL, '2023-07-26 14:49:58', '2024-08-27 20:47:50', NULL),
(108, 101, 'Sissejuhatus tervislikku toitumisse', '<p>Sellest programmist leiad palju maitsvaid ning põnevaid retsepte ning kogud hulganisti uusi teadmisi, mida enda igapäevaelus rakendada, et olla veel tervislikum ning tunda end oma kehas hästi. </p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 14, NULL, '2023-09-08 13:28:30', '2024-08-30 05:42:28', NULL),
(109, 101, 'Koos Vormi', '<p>Eesti tipptreenerite poolt kokku pandud 12-nädalane treeningprogramm, mis aitab valmistuda Kaitseväe kehaliste võimete kontrolltestiks. Programmist leiab nii jõudu arendavaid treeninguid treeneri juhendamisel kui ka iseseisvaid jooksutreeninguid.</p>', 'TRAINER_PROGRAM', '0.0000', NULL, 'EUR', 1, 365, NULL, 15, NULL, '2023-09-28 15:08:36', '2024-08-27 21:34:09', NULL),
(110, 101, 'Tagasi trennilainele', '<p>See 3-nädalane programm on suunatud inimestele, kes soovivad taastada või luua treeningharjumuse ja hea enesetunde.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 16, NULL, '2023-10-17 13:37:24', '2024-08-27 22:43:19', NULL),
(111, 101, 'Kesktaseme treenija', '<p>FitQ populaarsemate treenerite juhendamisel toimuv 4-nädalane treeningprogramm, mis on suunatud treenijale, kel on mõningane treenituse tase juba olemas.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 17, NULL, '2023-11-08 13:25:51', '2024-08-27 22:47:59', NULL),
(112, 101, 'Suusatamise baaskursus', '<p>Aitame suusatamisega algust teha spordihuvilisel, kel pole varasemat kokkupuudet suusatamisega või pole pikalt suuski alla saanud. Suusatreeneri Bert Tippi juhendamisel lihvime suusatehnikat. 9 nädalat kestev treeningkava, et ettevalmistuda Tartu Maratoni 31 km distantsiks.</p>', 'TRAINER_PROGRAM', '49.9900', NULL, 'EUR', 1, 365, NULL, 18, NULL, '2023-12-06 14:03:34', '2025-01-06 07:54:04', NULL),
(113, 101, 'Jooksuprogrammi jätkukursus', '<p>Talvine jooksutreeningute kava selleks, et kevadel ei peaks jooksmisega jälle nullist alustama, vaid saaks üle talve vormi hoida.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 19, NULL, '2024-01-09 13:04:08', '2024-08-27 23:31:54', NULL),
(114, 101, 'Vinyasa jooga Ginaga', '<p>Saavuta 10 nädalaga parem vorm ja tee koos joogatreener Gina Bergmanniga kaasa igal nädalal 1 joogatund.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 0, NULL, 20, NULL, '2024-04-16 07:01:00', '2024-08-30 07:05:02', NULL),
(115, 101, 'Jooksmise baaskursus', '<p>Alustajatele mõeldud jooksutehnika ja treeningprogramm. Eesmärk on õppida jooksma, et olla valmis läbima 10 km distants. Programm sobib neile, kes pole varem jooksmisega tegelenud.</p>', 'TRAINER_PROGRAM', '49.9900', NULL, 'EUR', 1, 0, NULL, 21, NULL, '2024-06-04 05:23:00', '2024-10-31 07:41:58', NULL),
(116, 101, 'Jooksmise kursus poolmaratoniks valmistujatele', 'Jooksukursus on mõeldud jooksuharrastajale, kes ei ole päris algaja ning sooviks valmistuda ette poolmaratoniks. Sobivaks võistluseks on Tartu Jooksumaratoni 21,1 km distants oktoobri lõpuks.', 'TRAINER_PROGRAM', '49.9900', NULL, 'EUR', 1, 0, NULL, 22, NULL, '2024-06-04 05:24:29', '2024-08-28 00:52:23', NULL),
(117, 101, 'Robus lower body', '<p></p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 23, NULL, '2023-04-11 17:03:04', '2024-08-28 01:28:45', NULL),
(118, 101, 'Robus full-body', '<p>This Robus Athletics program targets all muscles in your body. During this 4-week program, you will have 3 training sessions per week with one or sometimes two rest days between the workouts. The duration of the workouts is about 40 minutes.</p>', 'TRAINER_PROGRAM', '14.9900', NULL, 'EUR', 1, 365, NULL, 24, NULL, '2023-05-24 14:48:28', '2024-08-28 01:44:31', NULL),
(119, 120, 'Pilatesega vormi', 'Selles programmis parandad enda vormi ning õpid baasteadmisi pilatesest!', 'TRAINER_PROGRAM', '129.0000', NULL, 'EUR', 1, 365, NULL, 25, NULL, '2023-10-31 13:14:04', '2023-10-31 13:14:04', NULL),
(120, 126, 'Fit with Kristi', 'Saa toonuses lihased ja mõnus enesetunne 4-nädalase treeningprogrammiga, kust leiad trenne igale maitsele. Hea vormi saad saavutada ka kodust lahkumata ning Su keha veel tänab Sind!', 'TRAINER_PROGRAM', '24.9900', NULL, 'EUR', 1, 365, NULL, 26, NULL, '2023-07-07 13:14:04', '2024-09-09 12:05:13', NULL),
(121, 1869, 'Joogaampsud', 'Programmist leiad iga päev ühe kosutava joogatreeningu, mis võtab Sinu päevast vaid umbes 10 minutit. Hoolitse enda keha ja vaimu eest ning võta endale kasvõi kord päevas see aeg, kus oled vaid Sina ja proovi leida endaga kontakt läbi joogapraktika.', 'TRAINER_PROGRAM', '30.0000', NULL, 'EUR', 1, 365, NULL, 27, NULL, '2023-08-17 15:55:40', '2024-08-28 02:34:26', NULL),
(122, 8764, 'Vaagnapõhjalihaste treeningkursus', '8-nädalane kursus tutvustab naise vaagnapõhja olemust ning vaagnapõhjalihaste treeningut. Iga nädal on uus ja raskem treeningkava, mis parandab naise keha liikuvust ja lihaste jõudu, keskendudes eelkõige vaagnapõhjalihastele. Videotreeninguid toetavad põhjalikud abimaterjalid, mis aitavad mõista vaagnapiirkonna anatoomiat ja vaagnapõhjalihaste rolli keha toimimisel. Harjutused on videotes animeeritud, et saaks efektiivselt jälgida vaagnapõhjalihaste tööd ja treeningut korrektselt kaasa teha.', 'TRAINER_PROGRAM', '95.0000', NULL, 'EUR', 1, 365, NULL, 28, NULL, '2024-02-28 13:16:00', '2024-09-10 15:33:02', NULL),
(123, 8998, 'Hopa Beebi - 9 -kuuline treeningprogramm rasedatele', 'Hoia end ja kõhubeebit terve ja tugevana ning treeni ohutult kogu raseduse ajal. Programm sisaldab 27 erinevat videotreeningut, harjutusi ja nõuandeid. Lisaks käsiraamat koos toitumissoovitustega (64 lk).', 'TRAINER_PROGRAM', '99.0000', NULL, 'EUR', 1, 0, NULL, 29, NULL, '2023-10-19 18:15:34', '2024-08-28 03:01:11', NULL),
(124, 9042, 'Seljakooli trenniampsud', '<p>Seljakooli trenniampsud on mõnusad lühikesed harjutuste seeriad, mille abil saad treenida peamiselt oma alakeha ja korsetilihaseid. Harjutuskavad on kokku pannud energiline ja alati rõõmus treener Kirsti Kuhi. On lihtne leida aega treeninguks kui selleks kulub vaid 15 minutit!</p>', 'TRAINER_PROGRAM', '29.9000', NULL, 'EUR', 1, 365, NULL, 30, NULL, '2024-02-09 08:06:58', '2024-09-01 06:54:02', NULL),
(125, 9562, 'From Zero to Hero', 'From Zero to Hero programmi tasu', 'TRAINER_PROGRAM', '44.0000', NULL, 'EUR', 1, 365, NULL, 31, NULL, '2024-04-05 13:34:00', '2024-04-05 13:36:37', NULL),
(126, 4409, 'Poksitehnika algajale', '18-päevane poksitehnika õppimisele suunatud programm varasema kogemuseta poksihuvilisele. Lisaks löökide õppimisele keskendume ka jalgade tööle ning kaitsetehnikale.', 'TRAINER_PROGRAM', '11.9900', NULL, 'EUR', 1, 365, NULL, 32, NULL, '2024-05-29 19:52:00', '2024-05-29 19:52:00', NULL),
(127, 3717, 'Treeningkava', 'Treeningkava koosneb neljast osast ning koostatakse igale individuaalile vastavalt tema soovidele, olemasolevale varustusele ja võimetele. Võimalik ka lisaks treeningkavale osta videod, mis selgitavad igat harjutust.', 'TRAINER_TICKET', '30.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2024-09-18 10:39:40', '2024-09-18 10:39:40', NULL),
(128, 3717, 'Personaaltreening', 'Personaaltreeninguid viiakse läbi Tallinnas ja Tartus. Üks treening kestab 1h.', 'TRAINER_TICKET', '50.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-09-18 10:40:19', '2024-09-18 10:40:19', NULL),
(129, 101, 'Personaaltreening FitQ treeneriga', 'Personaaltreening FitQ treeneriga', 'TRAINER_TICKET', '50.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-09-26 10:36:04', '2024-09-27 10:23:35', '2024-09-27 10:23:35'),
(130, 3989, 'Personaaltreening 3x pakett', 'Pakett sisaldab 3x personaaltreeningut ja treeningkava iseseisvaks jätkamiseks.', 'TRAINER_TICKET', '120.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-10-06 19:01:30', '2024-10-29 20:12:06', '2024-10-29 20:12:06'),
(131, 3989, '1x personaaltreening', '', 'TRAINER_TICKET', '30.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-10-21 10:11:48', '2024-10-29 20:12:10', '2024-10-29 20:12:10'),
(132, 9562, 'Personaalne treeningkava 4ks nädalaks', 'Paketi hinnas sisaldub 30-minutiline personaalne veebikõne personaaltreener ja füsioterapeut Helina Kaldaga. Pärast kõnet koostab Helina just sulle mõeldud personaalse treeningkava. \nKava järgimine jääb juba sinu enda vastutada.', 'TRAINER_TICKET', '59.0000', NULL, 'EUR', 1, 0, NULL, NULL, 5, '2024-10-22 12:52:20', '2024-10-22 12:54:00', NULL),
(133, 101, 'FitQ Basic', 'FitQ Basic paketi aastane leping', 'TRAINER_SUBSCRIPTION_BASIC', '3.9900', NULL, 'EUR', 0, 30, 12, NULL, NULL, '2024-11-14 06:43:00', '2024-11-14 08:45:52', NULL),
(134, 101, '175: 35 päevane restart kogu kehale', '<p>35-päevane sportlik ja toitumisalane väljakutse, millega parandad <strong>GARANTEERITULT</strong> oma kehalist vormi lühikese ajaga märkimisväärselt. <strong>Kui tulemust ei ole, maksame sulle su osalustasu tagasi!</strong></p>', 'TRAINER_PROGRAM', '19.9900', NULL, 'EUR', 1, 365, NULL, 33, NULL, '2024-12-27 10:09:49', '2025-03-05 10:23:55', NULL),
(135, 101, 'FitQ Active 2025 monthly', 'FitQ + Medpoint Active 2025 monthly package', 'TRAINER_SUBSCRIPTION_PREMIUM', '30.0000', NULL, 'EUR', 0, 30, NULL, NULL, NULL, '2025-01-08 06:42:00', '2025-01-08 09:12:45', NULL),
(136, 101, 'FitQ Active 2025 quarterly', 'FitQ + Medpoint Active 2025 quarterly package', 'TRAINER_SUBSCRIPTION_PREMIUM', '100.0000', NULL, 'EUR', 0, 90, NULL, NULL, NULL, '2025-01-08 06:43:00', '2025-01-08 09:12:33', NULL),
(137, 101, 'FitQ personaalne treeningkava', 'Osta meilt personaalne treeningkava, vali sobiv periood ning saa kauba peale 50% kava hinnast lisaks e-poe kinkekaart.', 'TRAINER_TICKET', '400.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2025-01-08 10:00:14', '2025-06-30 05:51:33', NULL),
(138, 101, 'Joogareeded Ginaga', '<p>15 joogatrenni Eesti kõige lahedama joogatreeneri Gina Bergmanni poolt. Jooga treening parandab su vormi ja enesetunde mõne kuuga. Uus treening igal reedel 24. jaanuar - 2. mai</p>', 'TRAINER_PROGRAM', '49.9900', NULL, 'EUR', 1, 365, NULL, 34, NULL, '2025-01-23 18:15:18', '2025-01-23 18:30:19', NULL),
(139, 73, 'Kuutellimus', 'Ligipääs kõigile kanali videotele', 'TRAINER_SUBSCRIPTION', '14.9900', NULL, 'EUR', 1, 30, NULL, NULL, NULL, '2025-03-03 13:29:36', '2025-03-03 13:29:36', NULL),
(140, 101, '3-kuuline AI-treeneri personaalne treeningkava', '3-kuuline AI-treeneri personaalne treeningkava keharaskusega koduseks treeninguks, mis on seadistatud vastavalt sinu eesmärkidele. Kauba peale 75€ tasuta treeningvarustust', 'TRAINER_TICKET', '99.0000', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2025-03-25 05:24:57', '2025-06-30 05:51:58', '2025-06-30 05:51:58'),
(141, 101, 'FitQ Medpoint kinkepakett', 'Tasuta kuu aega FitQ Premium kasutamist Medpoint e-poe ostuga', 'TRAINER_SUBSCRIPTION_PREMIUM', '29.9900', NULL, 'EUR', 0, 31, NULL, NULL, NULL, '2025-03-27 15:18:37', '2025-03-27 15:18:37', NULL),
(142, 4898, 'Testing - copy', '<p>sadas<a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://app.fitq.me/et/pricing\">das</a></p>', 'TRAINER_PROGRAM', '22.5000', NULL, 'EUR', 1, 365, NULL, 38, NULL, '2025-04-09 09:15:48', '2025-04-09 09:15:48', NULL),
(143, 73, '175: 33 päevane restart kogu kehale - copy', 'Tuleb trenni teha', 'TRAINER_PROGRAM', '19.9900', NULL, 'EUR', 1, 365, NULL, 39, NULL, '2025-04-16 06:54:34', '2025-04-16 06:54:34', NULL),
(144, 73, '30 päevaga vormi', 'Personaalne 30 päevane treeningkava', 'TRAINER_TICKET', '49.9900', NULL, 'EUR', 1, 0, NULL, NULL, 3, '2025-04-16 06:58:14', '2025-04-16 06:58:14', NULL),
(145, 101, 'Egle treeningprogramm', '<p>Saad tugevaks</p>', 'TRAINER_PROGRAM', '20.0000', NULL, 'EUR', 1, 365, NULL, 40, NULL, '2025-05-09 08:57:43', '2025-05-09 08:57:43', NULL),
(146, 101, 'Crossfit trenn', '', 'TRAINER_TICKET', '15.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2025-05-09 09:09:17', '2025-05-09 09:09:39', '2025-05-09 09:09:39'),
(147, 101, 'Crossfit trenn', '', 'TRAINER_TICKET', '15.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2025-05-09 09:11:19', '2025-06-18 10:00:42', '2025-06-18 10:00:42'),
(148, 4898, 'Testin hinda', '<p>a</p>', 'TRAINER_PROGRAM', '10.0000', NULL, 'EUR', 1, 365, NULL, 41, NULL, '2025-06-25 09:22:58', '2025-06-25 09:22:58', NULL),
(149, 4898, 'Testin hinda - copy', '<p>a</p>', 'TRAINER_PROGRAM', '10.0000', NULL, 'EUR', 1, 365, NULL, 42, NULL, '2025-06-25 09:23:11', '2025-06-25 09:23:11', NULL),
(150, 4898, 'ss', '<p>dd</p>', 'TRAINER_PROGRAM', '22.0000', NULL, 'EUR', 1, 365, NULL, 43, NULL, '2025-06-25 09:23:41', '2025-06-25 09:23:41', NULL),
(151, 4898, 'ss - copy', '<p>dd</p>', 'TRAINER_PROGRAM', '22.0000', NULL, 'EUR', 1, 365, NULL, 44, NULL, '2025-06-25 09:24:34', '2025-06-25 09:24:34', NULL),
(152, 101, '30 joogatrenni Ginaga', '<p>Jooga on nii hea treening, et võid seda teha kasvõi iga päev. Programm sisaldab 30 joogatrennivideot koduseks kaasategemiseks. Videod on loonud ja harjutusi demonstreerib Eesti parim joogatreener Gina Bergmann. Jooga on treening, mis parandab su vormi ja enesetunnet  kuu ajaga tundmatuseni. </p>', 'TRAINER_PROGRAM', '9.9900', NULL, 'EUR', 1, 365, NULL, 37, NULL, '2025-06-25 09:24:34', '2025-06-25 10:12:02', NULL),
(153, 12167, 'Motivatsioon ja järjepidevus', '<p>Kas tahaksid liikuda rohkem, kuid leiad ennast ikka ja jälle õhtul diivanilt scrollimas? Kas maksad kuude viisi trennipaketti, kuid lihtsalt ei suuda leida aega, jõudu ega motivatsiooni, et ennast päriselt saali kohale vedada?</p>', 'TRAINER_PROGRAM', '89.0000', NULL, 'EUR', 1, 365, NULL, 45, NULL, '2025-07-23 06:42:52', '2025-07-23 07:27:55', NULL),
(154, 131, 'Zumba', '', 'TRAINER_TICKET', '3.0000', NULL, 'EUR', 1, 0, NULL, NULL, 4, '2025-07-28 17:35:31', '2025-07-28 17:35:31', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
