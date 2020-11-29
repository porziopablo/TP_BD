CREATE TABLE Auditoria(
	numeroEmpleado int NOT NULL,
	fechaInicioTrabajo date NOT NULL, /* YYYY-MM-DD */
	numeroAuditoria int NOT NULL,
	fechaHoraAuditoria datetime NOT NULL,
	resultadoAuditoria nvarchar(20),
	PRIMARY KEY(numeroEmpleado, fechaInicioTrabajo, numeroAuditoria),
	CONSTRAINT fk_Auditoria_nroEmpleado FOREIGN KEY(numeroEmpleado, fechaInicioTrabajo) REFERENCES DondeTrabajaC(numeroEmpleado, fechaInicioTrabajo),
	CONSTRAINT resultadoValido CHECK( resultadoAuditoria in( 'aprobado', 'desaprobado'))
)