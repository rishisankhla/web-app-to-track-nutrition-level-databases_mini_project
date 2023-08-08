CREATE DATABASE foodwebsite;
USE foodwebsite;
CREATE USER 'foodappuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'food123';
GRANT ALL PRIVILEGES ON foodwebsite.* TO 'foodappuser'@'localhost';
CREATE TABLE user_details (username varchar(255),first_name varchar(255),last_name varchar(255),hashedPassword varchar(255),email varchar(255));
ALTER TABLE user_details ADD id INT PRIMARY KEY AUTO_INCREMENT;
CREATE TABLE food_details (username varchar(255),food_name varchar(255),typical_values varchar(255),unit_typical_values varchar(255),Carbs varchar(255),Fat varchar(255),Protein varchar(255),Salt varchar(255),Sugar varchar(255));
ALTER TABLE food_details ADD id INT PRIMARY KEY AUTO_INCREMENT;