DROP PROCEDURE IF EXISTS dbo.IngresosNoAutorizados
GO

CREATE PROCEDURE IngresosNoAutorizados
	@CANT_DIAS INT,
	@INTENTOS INT
AS
BEGIN
	SELECT E.nombreEmpleado,E.apellidoEmpleado,E.funcionEmpleado
	FROM EMPLEADO E
	WHERE E.numeroEmpleado IN (SELECT ENP.numeroEmpleado
								FROM SEMUEVEEN SM,AREA A, EMPLEADONOPROFESIONAL ENP
								WHERE SM.resultadoMov = 'no autorizado' AND SM.numeroEmpleado = ENP.numeroEmpleado AND SM.numeroArea = A.numeroArea 
								AND A.numeroNivel != ENP.numeroNivel )
		  OR E.numeroEmpleado IN (  SELECT SME.numeroEmpleado
									FROM SEMUEVEEN SME
									WHERE SME.resultadoMov = 'no autorizado' AND E.numeroEmpleado = SME.numeroEmpleado 
									AND DATEDIFF(day, SME.fechaHoraMov,GETDATE()) < @CANT_DIAS
									GROUP BY SME.numeroEmpleado
									HAVING COUNT (*)>@INTENTOS)
END
GO