CREATE DATABASE IF NOT EXISTS `ecommerce`;

USE `ecommerce`;

CREATE TABLE IF NOT EXISTS `produks` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `price` int(10) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

INSERT INTO `produks` (`id`, `name`, `price`, `image`) VALUES
(1, 'Kaos Hitam', 100000, '/images/kaoshitam.png'),
(2, 'Sepatu Keren', 250000, '/images/sepatu keren.png'),
(3, 'Topi Trendy', 75000, '/images/topitrendy.png')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `price` = VALUES(`price`),
  `image` = VALUES(`image`);
