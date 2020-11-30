CREATE TABLE EmpleadoNoProfesional(
	numeroEmpleado int primary key NOT NULL, 
	numeroNivel int NOT NULL,
	CONSTRAINT fk_NoProfesional_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_NoProfesional_nroNivel FOREIGN KEY(numeroNivel) REFERENCES NivelSeguridad(numeroNivel)
)