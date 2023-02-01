DROP TABLE  IF EXISTS comments;
CREATE TABLE comments(

  comment_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id),
  resource_id INT NOT NULL REFERENCES resources(resource_id),
  comment_text TEXT,
  comment_likes INT,
  comment_time DATE
);

INSERT INTO comments (user_id, resource_id, comment_text, comment_likes, comment_time)
VALUES
(1, 1, 'Great resource!', 10, '2022-01-01'),
(2, 1, 'I agree, very helpful.', 5, '2022-01-02'),
(3, 2, 'I found some errors in this resource.', 2, '2022-01-03'),
(4, 2, 'Thanks for pointing that out, I will fix it.', 0, '2022-01-03'),
(1, 3, 'This resource helped me a lot.', 8, '2022-01-04'),
(2, 3, 'Glad to hear that!', 3, '2022-01-05'),
(3, 4, 'Not useful for me.', 1, '2022-01-06'),
(4, 4, 'Sorry to hear that, can you please provide more feedback?', 0, '2022-01-06'),
(1, 5, 'I love this resource!', 10, '2022-01-07'),
(2, 5, 'Me too!', 5, '2022-01-08'),
(3, 6, 'This is a great resource.', 8, '2022-01-09'),
(4, 6, 'Thanks!', 3, '2022-01-10'),
(1, 7, 'This resource is helpful.', 7, '2022-01-11'),
(2, 7, 'I agree.', 5, '2022-01-12'),
(3, 8, 'I found some errors in this resource.', 2, '2022-01-13');
DROP TABLE  IF EXISTS users;
CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	user_name VARCHAR(255),
  	user_isfaculty BOOLEAN
);

INSERT INTO users (user_name, user_isfaculty)
VALUES 
('Tinashe Gutu', true),
('Sinbad Creswell', true),
('Maghfoor Ahmed', true),
('Didier Osindero', false),
('Katrina Woolley', false),
('Ben Murray', false),
('Zac Gladman', false),
('Maria Ten', false),
('Grace Kuperman', false),
('Alessia Borys', false),
('Josiah Adiojutelegan', false),
('Neil Bogie', true),
('Katie Davies', true);


DROP TABLE  IF EXISTS resources;
CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    resource_post_date DATE NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) ,
    user_id INT NOT NULL REFERENCES users(user_id),
    resource_description TEXT ,
    resource_tags TEXT ,
    resource_content_type TEXT ,
    resource_user_recommendation TEXT,
    resource_recommendation_reason TEXT,
    resource_likes INTEGER,
    resource_dislikes INTEGER
	resource_link TEXT
);
INSERT INTO resources (resource_post_date, resource_name, author_name, user_id, resource_description, resource_tags, resource_content_type, resource_user_recommendation, resource_recommendation_reason, resource_likes,resource_dislikes resource_link)
VALUES 
('2022-01-01', 'Resource 1', 'Author 1', 1, 'This is a description for resource 1', 'tag1, tag2', 'pdf', 'yes', 'good resource', 10,2, 'www.resource1.com'),
('2022-01-02', 'Resource 2', 'Author 2', 2, 'This is a description for resource 2', 'tag3, tag4', 'video', 'yes', 'good resource', 15,3, 'www.resource2.com'),
('2022-01-03', 'Resource 3', 'Author 3', 3, 'This is a description for resource 3', 'tag5, tag6', 'pdf', 'no', '', 20,5, 'www.resource3.com'),
('2022-01-04', 'Resource 4', 'Author 4', 4, 'This is a description for resource 4', 'tag7, tag8', 'audio', 'yes', 'good resource', 25,4, 'www.resource4.com'),
('2022-01-05', 'Resource 5', 'Author 5', 1, 'This is a description for resource 5', 'tag9, tag10', 'pdf', 'no', '', 30,2, 'www.resource5.com'),
('2022-01-06', 'Resource 6', 'Author 6', 2, 'This is a description for resource 6', 'tag11, tag12', 'video', 'yes', 'good resource', 35,5, 'www.resource6.com'),
('2022-01-07', 'Resource 7', 'Author 7', 3, 'This is a description for resource 7', 'tag13, tag14', 'pdf', 'no', '', 40,0, 'www.resource7.com'),
('2022-01-08', 'Resource 8', 'Author 8', 4, 'This is a description for resource 8', 'tag15, tag16', 'audio', 'yes', 'good resource', 45,2, 'www.resource8.com'),
('2022-01-09', 'Resource 9', 'Author 9', 1, 'This is a description for resource 9', 'tag17, tag18', 'pdf', 'no', '', 50,1, 'www.resource9.com'),
('2022-01-10', 'Resource 10', 'Author 10', 2, 'This is a description for resource 10', 'tag19, tag20', 'video', 'yes', 'good resource', 55,5, 'www.resource10.com'),
('2022-01-11', 'Resource 11', 'Author 11', 3, 'This is a description for resource 11', 'tag21, tag22', 'pdf', 'no', '', 60,19, 'www.resource11.com'),
('2022-01-12', 'Resource 12', 'Author 12', 4, 'This is a description for resource 12', 'tag23, tag24', 'audio', 'yes', 'good resource', 65,6, 'www.resource12.com')


