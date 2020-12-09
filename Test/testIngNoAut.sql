INSERT INTO [dbo].[SeMueveEn]
           ([numeroEmpleado]
           ,[numeroArea]
           ,[fechaHoraMov]
           ,[resultadoMov]
           ,[tipoMov])
     VALUES
	 -- ingreso un movimiento de un no profesional asignado a un area baja o media que quiere entrar a una alta ( primer select )
           (4,3,'2020-10-10 10:12:13.3456712','no autorizado','ingreso'),
	-- ingreso 6 intentos de ingreso no autorizados en menos de 30 dias (segundo select)
			(2,3,'2020-12-01 10:12:13.3456712','no autorizado','ingreso'),
			(2,3,'2020-12-02 10:12:13.3456712','no autorizado','ingreso'),
			(2,3,'2020-12-03 10:12:13.3456712','no autorizado','ingreso'),
			(2,3,'2020-12-04 10:12:13.3456712','no autorizado','ingreso'),
			(2,3,'2020-12-05 10:12:13.3456712','no autorizado','ingreso'),
			(2,3,'2020-12-06 10:12:13.3456712','no autorizado','ingreso')

