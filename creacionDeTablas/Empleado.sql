CREATE TABLE Empleado(
	numeroEmpleado int primary key identity NOT NULL, 
	/* PK autoincremental con identity. Arranca con 1 e incrementa de a uno por default*/
	nombreEmpleado varchar(30) NOT NULL,
	apellidoEmpleado varchar(30) NOT NULL,
	funcionEmpleado varchar(20) NOT NULL,	
	contrasena varchar(30) NOT NULL,
	huellaDactilar varchar(30) unique NOT NULL,
	CONSTRAINT funcionInvalida CHECK (funcionEmpleado in('no profesional', 'profesional', 'jerarquico')),
	/* con check valido que la funcion del empleado pueda ser solo las que explicito*/
	CONSTRAINT huellaUnica UNIQUE(huellaDactilar),
	/* con unique valido que las huellas dactilares no se repitan para dos empleados diferentes*/
	CONSTRAINT nombreEmpVacio CHECK (nombreEmpleado != ''),
	CONSTRAINT apellidoEmpVacio CHECK (apellidoEmpleado != ''),
	CONSTRAINT huellaEmpVacio CHECK (huellaDactilar != ''),
	CONSTRAINT contraLongitudInvalida CHECK (DATALENGTH(contrasena) > 8)
)