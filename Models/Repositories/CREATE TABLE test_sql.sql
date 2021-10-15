/* CREATE TABLE test_sql
(
	id int PRIMARY key IDENTITY,
	namePersonal NVARCHAR(30) not null,
	phoneNumber VARCHAR(30) UNIQUE,
	agePersonal int
		CONSTRAINT DF_agePersonal DEFAULT 18
		CONSTRAINT CH_agePersonal CHECK(agePersonal>17 and agePersonal<60)
)
GO
CREATE TABLE test_sql_slave
(
	id int PRIMARY KEY IDENTITY,  //глобальная переменная инкремент
	idPersonal int,
	status_dismissal BIT DEFAULT 0,
	numb_current_tasks int,
	date_begin_work date,
	positionPersonal NVARCHAR(20) DEFAULT 'trainee' not NULL,
	FOREIGN KEY (idPersonal) REFERENCES test_sql(id)
)
GO*/
/*  
select namePersonal + ' phone('+phoneNumber +')' as People
from test_sql 

ALTER TABLE test_sql_slave 
ADD price DECIMAL not NULL DEFAULT 0*/
/* INSERT into test_sql_slave
	(price)
VALUES
	(160) */
SELECT
	o.TagComment [name],
	m.VarValue val,
	sh.VarValue prevVal
FROM ShortHistory sh
	JOIN Settings_OPCTagsList o
	ON o.TagName LIKE '%T_Futerovki%'
		AND o.Tag_ID=sh.TagId
		AND sh.HH=DATEPART(HOUR, GETDATE())-1
		AND DATEPART(MINUTE, sh.[DateTime])=0
		AND FORMAT(sh.[DateTime], 'yyyy-MM-dd') = FORMAT(GETDATE(), 'yyyy-MM-dd')
	JOIN Minuta m
	ON m.VarName LIKE '%T_Futerovki%'
		AND m.VarName=o.TagName
ORDER BY o.TagComment
