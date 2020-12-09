INSERT INTO [dbo].[TieneAsignado]
           ([numeroEmpleado]
           ,[numeroArea]
           ,[numeroFranja])
     VALUES
		   -- empleado que esta en todas las areas de su nivel, debe aparecer
           (3,1,1), (3,3,3), (3,4,2), (3,6,2),
		   (49,2,1), (49,7,3), (49,9,2),
		   -- empleado que esta en todas las areas de su nivel excepto una, no debe aparecer
		   (37,5,1), (37,8,3)

