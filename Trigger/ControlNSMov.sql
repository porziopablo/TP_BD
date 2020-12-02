CREATE TRIGGER ControlNSMov
ON SEMUEVEEN
FOR INSERT, UPDATE
AS

	IF EXISTS (SELECT inserted.* 
				FROM inserted,AREA A,NIVELSEGURIDAD NS
				WHERE inserted.numeroArea = A.numeroArea AND A.numeroNivel = NS.numeroNivel AND NS.tipoNivel = 'bajo')
	BEGIN
		raiserror ('El nivel de seguridad bajo no registra mov.', 16, 1)
		rollback transaction
	END