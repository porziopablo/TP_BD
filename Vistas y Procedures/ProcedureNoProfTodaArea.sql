DROP PROCEDURE IF EXISTS dbo.NoProfTodaArea
GO

CREATE PROCEDURE NoProfTodaArea
AS
BEGIN
	SELECT E.numeroEmpleado, E.nombreEmpleado, E.apellidoEmpleado
	FROM Empleado E, EmpleadoNoProfesional ENP
	WHERE E.numeroEmpleado = ENP.numeroEmpleado 
		  AND NOT EXISTS (SELECT *
						  FROM Area A
						  WHERE A.numeroNivel = ENP.numeroNivel AND 
							    NOT EXISTS (SELECT *
											FROM TieneAsignado T
											WHERE T.numeroArea = A.numeroArea
												  AND T.numeroEmpleado = ENP.numeroEmpleado
											)
						 )	
END
GO
