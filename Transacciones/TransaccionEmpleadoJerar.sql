BEGIN TRANSACTION
	DECLARE @EmpleadoID int
BEGIN TRY
	--Insertamos el Empleado.
	INSERT INTO [dbo].[Empleado]
           ([nombreEmpleado]
           ,[apellidoEmpleado]
           ,[funcionEmpleado]
           ,[contrasena]
           ,[huellaDactilar])
     VALUES ('nombreEmpleado','apellidoEmpleado','funcionEmpleado','contrasena','huellaDactilar');

	 SET @EmpleadoID = SCOPE_IDENTITY();

	 -- Insertamos como jerarquico.
	INSERT INTO [dbo].[EmpleadoJerarquico]
           ([numeroEmpleado]
           ,[fechaInicio]
           ,[numeroArea])
     VALUES
           (@EmpleadoID,'fechaInicio','numeroArea')


	COMMIT TRANSACTION
END TRY

BEGIN CATCH
    ROLLBACK TRANSACTION;
	DECLARE @MsjError VARCHAR(200);
	SET @MsjError = ERROR_MESSAGE();
    RAISERROR(@MsjError,18,1);
END CATCH
