CREATE TRIGGER ControlNSMov
ON SEMUEVEEN
FOR INSERT, UPDATE
AS 
	declare @nivel_area INT
	declare @tipo_nivel varchar(20)

	SELECT @nivel_area = numeroNivel 
	FROM AREA
	JOIN inserted
	ON inserted.numeroArea = AREA.numeroArea
	WHERE AREA.numeroArea = inserted.numeroArea

	SELECT @tipo_nivel = tipoNivel 
	FROM NIVELSEGURIDAD
	WHERE @nivel_area = NIVELSEGURIDAD.numeroNivel

	IF (@tipo_nivel = 'bajo')
	BEGIN
		raiserror ('El nivel de seguridad bajo no registra mov.', 16, 1)
		rollback transaction
	END