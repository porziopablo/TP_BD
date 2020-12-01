DROP VIEW IF EXISTS IngresoFallido
GO

CREATE VIEW IngresoFallido AS

SELECT E.*, A.*
FROM Empleado E, Area A
WHERE EXISTS (SELECT *
			  FROM SeMueveEn MOV1
			  WHERE MOV1.fechaHoraMov >= DATEADD(day, DATEDIFF(day,0,GETDATE()),0) AND -- día actual a las 00:00 hs.
					MOV1.numeroEmpleado = E.numeroEmpleado AND MOV1.numeroArea = A.numeroArea AND
					MOV1.tipoMov = 'ingreso' AND MOV1.resultadoMov = 'no autorizado' AND
					NOT EXISTS (SELECT *
								FROM SeMueveEn MOV2
								WHERE MOV2.fechaHoraMov >= MOV1.fechaHoraMov AND
									  MOV2.numeroEmpleado = E.numeroEmpleado AND MOV2.numeroArea = A.numeroArea AND
									  MOV2.tipoMov = 'ingreso' AND MOV2.resultadoMov = 'autorizado'
								)
			)
GO