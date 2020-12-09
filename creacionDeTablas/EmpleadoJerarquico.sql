CREATE TABLE EmpleadoJerarquico(
	numeroEmpleado int PRIMARY KEY NOT NULL,
	fechaInicio date NOT NULL,
	numeroArea int UNIQUE NOT NULL,
	CONSTRAINT fk_Jerarquico_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_Jerarquico_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT checkEsJerarquico CHECK(dbo.esJerarquico(numeroEmpleado) = 1)
)