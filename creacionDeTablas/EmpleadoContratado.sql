CREATE TABLE EmpleadoContratado(
	numeroEmpleado int PRIMARY KEY NOT NULL,
	CONSTRAINT fk_Contratado_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT checkEsContratado CHECK(dbo.esContratado(numeroEmpleado) = 1)
)