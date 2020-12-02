CREATE FUNCTION EsContratado(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'contratado' = (SELECT EP.contratacionProfesional
						   FROM EmpleadoProfesional EP
						   WHERE EP.numeroEmpleado = @numeroEmpleado
						  )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;