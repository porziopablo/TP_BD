CREATE FUNCTION EstaLibre(@numeroEmpleado INT, @fechaInicio DATE)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF @fechaInicio > (SELECT TOP 1 DTC.fechaFinTrabajo
					FROM DONDETRABAJAC DTC
					WHERE DTC.numeroEmpleado = @numeroEmpleado
					ORDER BY DTC.fechaFinTrabajo DESC)
			SET @OK = 1
		ELSE
			SET @OK = 0

		RETURN @OK
	END