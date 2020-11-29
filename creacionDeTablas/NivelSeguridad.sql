CREATE TABLE NivelSeguridad(
	numeroNivel int primary key identity NOT NULL,
	tipoNivel nvarchar(20),
	CONSTRAINT nivelValido CHECK (tipoNivel in ('bajo', 'medio', 'alto'))
)