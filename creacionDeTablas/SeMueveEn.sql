CREATE TABLE SeMueveEn(
	numeroEmpleado int NOT NULL,
	numeroArea int NOT NULL,
	fechaHoraMov datetime2(7) NOT NULL,
	resultadoMov nvarchar(20),
	tipoMov nvarchar(10),
	PRIMARY KEY(numeroEmpleado, fechaHoraMov),
	CONSTRAINT fk_SeMueveEn_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_SeMueveEn_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT resultadoInvalido CHECK (resultadoMov in('autorizado', 'no autorizado')),
	CONSTRAINT tipoInvalido CHECK (tipoMov in('ingreso', 'egreso')),
	CONSTRAINT fechaMovInvalida CHECK  (fechaHoraMov<getdate()),
	CONSTRAINT movimientoInvalido CHECK ((tipoMov = 'egreso' AND resultadoMov = 'autorizado') OR (tipoMov = 'ingreso'))
)