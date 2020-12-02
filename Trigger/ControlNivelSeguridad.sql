CREATE TRIGGER ControlNivelSeguridad
ON TIENEASIGNADO
FOR INSERT, UPDATE
AS 
	IF EXIST (SELECT inserted.*
				FROM inserted,AREA A,EMPLEADONOPROFESIONAL ENP
				WHERE inserted.numeroEmpleado = ENP.numeroEmpleado AND inserted.numeroArea = A.numeroArea AND 
					ENP.numeroNivel != A.numeroNivel)
	BEGIN
		raiserror ('Los niveles de seguridad del Area y el Empleado no coinciden', 16, 1)
		rollback transaction
	END