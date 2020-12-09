CREATE TABLE EmpleadoProfesional(
	numeroEmpleado int primary key NOT NULL, 
	contratacionProfesional nvarchar(20) NOT NULL,
	numeroEspecialidad int NOT NULL,
	CONSTRAINT fk_Profesional_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT contratacionValida CHECK( contratacionProfesional in ('contratado', 'permanente')),
	CONSTRAINT fk_Profesional_nroEspecialidad FOREIGN KEY(numeroEspecialidad) REFERENCES Especialidad(numeroEspecialidad),
	CONSTRAINT checkEsProfesional CHECK(dbo.esProfesional(numeroEmpleado) = 1)
)