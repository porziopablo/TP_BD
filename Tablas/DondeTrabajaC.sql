CREATE TABLE DondeTrabajaC(
	numeroEmpleado int NOT NULL,
	fechaInicioTrabajo date NOT NULL, /* YYYY-MM-DD */
	fechaFinTrabajo date NOT NULL,
	numeroArea int NOT NULL,
	descripcionTrabajo nvarchar(50),
	PRIMARY KEY(numeroEmpleado, fechaInicioTrabajo),
	CONSTRAINT fk_DondeTrabajaC_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fk_DondeTrabajaC_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado)
)