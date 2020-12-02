CREATE TABLE Especialidad(
	numeroEspecialidad int PRIMARY KEY IDENTITY NOT NULL,
	nombreEspecialidad nvarchar(30),
	CONSTRAINT especialidadNoVacia CHECK (nombreEspecialidad != '')
)