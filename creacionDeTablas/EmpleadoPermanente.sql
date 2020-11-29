CREATE TABLE EmpleadoPermanente(
	numeroEmpleado int primary key NOT NULL, 
	numeroArea int NOT NULL,
	CONSTRAINT fk_Permanente_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_Permanente_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea)
)