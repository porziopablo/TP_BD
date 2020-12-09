INSERT INTO [dbo].[SeMueveEn]
           ([numeroEmpleado]
           ,[numeroArea]
           ,[fechaHoraMov]
           ,[resultadoMov]
           ,[tipoMov])
     VALUES
		   -- CAMBIAR FECHA X DIA DE HOY
		   
		   -- ingreso no autorizado sucedido hoy, debe aparecer
           (23,3, '2020-12-10 10:12:13.3456712', 'no autorizado', 'ingreso'),
		   -- ingreso no autorizado sucedido ayer, no debe aparecer
		   (11,2, '2020-12-09 23:59:59.9999999', 'no autorizado', 'ingreso'),
		   -- ingreso no autorizado pero con posterior autorizado, ambos hoy, no debe aparecer
		   (45,3, '2020-12-10 09:12:13.3456712', 'no autorizado', 'ingreso'),
		   (45,3, '2020-12-10 09:15:14.3556992', 'autorizado', 'ingreso'),
		   -- ingreso no autorizado pero con posterior autorizado a OTRA AREA, ambos hoy, debe aparecer
		   (40,2, '2020-12-10 05:12:13.3456712', 'no autorizado', 'ingreso'),
		   (40,3, '2020-12-10 08:15:14.3556992', 'autorizado', 'ingreso'),
		   -- ingreso autorizado pero con posterior no autorizado, ambos hoy, debe aparecer
		   (29,7, '2020-12-10 00:00:00.0000000', 'autorizado', 'ingreso'),
		   (29,7, '2020-12-10 00:02:00.0000000', 'no autorizado', 'ingreso'),
		   -- ingreso autorizado con egreso , ambos hoy, no debe aparecer
		   (15,6, '2020-12-10 06:00:00.0000000', 'autorizado', 'ingreso'),
		   (15,6, '2020-12-10 07:02:00.0000000', 'autorizado', 'egreso')