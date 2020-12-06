CREATE FUNCTION estaLibre(@numeroEmpleado INT, @fechaInicio DATE)

RETURNS INT

AS
    BEGIN
        DECLARE @OK INT

        IF NOT EXISTS (SELECT * FROM DONDETRABAJAC DTC WHERE DTC.numeroEmpleado = @numeroEmpleado AND DTC.fechaInicioTrabajo != @fechaInicio)
            SET @OK = 1

        ELSE IF @fechaInicio > (SELECT TOP 1 DTC.fechaFinTrabajo
                        FROM DONDETRABAJAC DTC
                        WHERE DTC.numeroEmpleado = @numeroEmpleado AND DTC.fechaInicioTrabajo != @fechaInicio
                        ORDER BY DTC.fechaFinTrabajo DESC)
                SET @OK = 1
            ELSE
                SET @OK = 0

        RETURN @OK
    END