-- Total poyas num=12 (0, 1668, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
-- poyas rays num=32
-- total date rows num = 12*32=384

with
	t
	as
	(
		select
			count(*) cnt,
			Date date
		from T1150History
		group BY [Date]
	),
	dates
	as
	(
		select date
		from t
		where t.cnt>384
	)
select *
from dates