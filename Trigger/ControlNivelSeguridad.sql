CREATE TRIGGER ControlNivelSeguridad
ON TIENEASIGNADO
FOR INSERT, UPDATE
AS 
	declare @nivel_area INT
	declare @nivel_empleado INT

	SELECT @nivel_area = numeroNivel FROM AREA
	JOIN inserted
	ON inserted.numeroArea = AREA.numeroArea
	WHERE AREA.numeroArea = inserted.numeroArea

	SELECT @nivel_empleado = numeroNivel FROM EMPLEADONOPROFESIONAL
	JOIN inserted
	ON inserted.numeroEmpleado = EMPLEADONOPROFESIONAL.numeroEmpleado
	WHERE EMPLEADONOPROFESIONAL.numeroEmpleado = inserted.numeroEmpleado

	IF (@nivel_area != @nivel_empleado)
	BEGIN
		raiserror ('Los niveles de seguridad del Area y el Empleado no coinciden', 16, 1)
		rollback transaction
	END