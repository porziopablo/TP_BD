-------------------- FUNCIONES --------------------

CREATE FUNCTION estaLibre(@numeroEmpleado INT, @fechaInicio DATE)

RETURNS INT

AS
    BEGIN
        DECLARE @OK INT

        IF NOT EXISTS (SELECT * FROM DONDETRABAJAC DTC WHERE DTC.numeroEmpleado = @numeroEmpleado AND DTC.fechaInicioTrabajo != @fechaInicio)
            SET @OK = 1

        ELSE IF @fechaInicio > (SELECT TOP 1 DTC.fechaFinTrabajo
                        FROM DONDETRABAJAC DTC
                        WHERE DTC.numeroEmpleado = @numeroEmpleado AND DTC.fechaInicioTrabajo != @fechaInicio
                        ORDER BY DTC.fechaFinTrabajo DESC)
                SET @OK = 1
            ELSE
                SET @OK = 0

        RETURN @OK
    END;
GO

CREATE FUNCTION EsContratado(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'contratado' = (SELECT EP.contratacionProfesional
						   FROM EmpleadoProfesional EP
						   WHERE EP.numeroEmpleado = @numeroEmpleado
						  )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;
GO

CREATE FUNCTION EsJerarquico(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'jerarquico' = (SELECT E.funcionEmpleado
						   FROM Empleado E
						   WHERE E.numeroEmpleado = @numeroEmpleado
						  )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;
GO

CREATE FUNCTION EsNoProfesional(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'no profesional' = (SELECT E.funcionEmpleado
						       FROM Empleado E
						       WHERE E.numeroEmpleado = @numeroEmpleado
						      )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;
GO

CREATE FUNCTION EsPermanente(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'permanente' = (SELECT EP.contratacionProfesional
						   FROM EmpleadoProfesional EP
						   WHERE EP.numeroEmpleado = @numeroEmpleado
						  )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;
GO

CREATE FUNCTION EsProfesional(@numeroEmpleado INT)

RETURNS INT

AS
	BEGIN
		DECLARE @OK INT

		IF 'profesional' = (SELECT E.funcionEmpleado
						    FROM Empleado E
						    WHERE E.numeroEmpleado = @numeroEmpleado
						   )
			SET @OK = 1
		ELSE
			SET @OK = 0
		
		RETURN @OK
	END;
GO

-------------------- TABLAS --------------------

CREATE TABLE FranjaHoraria(
	numeroFranja int PRIMARY KEY IDENTITY NOT NULL,
	horaInicio time(0) NOT NULL,
	horaFin time(0) NOT NULL,
	CONSTRAINT franjaValida UNIQUE(horaInicio, horafin),
	CONSTRAINT horaFinValida CHECK(horaFin > horaInicio)
);


CREATE TABLE Especialidad(
	numeroEspecialidad int PRIMARY KEY IDENTITY NOT NULL,
	nombreEspecialidad nvarchar(30) UNIQUE,
	CONSTRAINT especialidadNoVacia CHECK (nombreEspecialidad != '')
);


CREATE TABLE NivelSeguridad(
	numeroNivel int primary key identity NOT NULL,
	tipoNivel nvarchar(20) unique,
	CONSTRAINT nivelValido CHECK (tipoNivel in ('bajo', 'medio', 'alto'))
);


CREATE TABLE Area(
	numeroArea int PRIMARY KEY identity NOT NULL,
	nombreArea nvarchar(30) UNIQUE NOT NULL,
	numeroNivel int NOT NULL,
	CONSTRAINT fk_nroNivel FOREIGN KEY(numeroNivel) REFERENCES NivelSeguridad(numeroNivel),
	CONSTRAINT nombreAreaVacio CHECK (nombreArea != '')
);


CREATE TABLE Evento(
	numeroEvento int identity NOT NULL, 
	numeroArea int NOT NULL,
	descripcionEvento nvarchar(500),
	fechaHoraEvento datetime,
	PRIMARY KEY(numeroEvento, numeroArea),
	CONSTRAINT fk_Evento_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fechaEventoValida CHECK (fechaHoraEvento < GETDATE()),
	CONSTRAINT descEventoInvalida CHECK (descripcionEvento != '')
);


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
);


CREATE TABLE EmpleadoJerarquico(
	numeroEmpleado int PRIMARY KEY NOT NULL,
	fechaInicio date NOT NULL,
	numeroArea int UNIQUE NOT NULL,
	CONSTRAINT fk_Jerarquico_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_Jerarquico_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT checkEsJerarquico CHECK(dbo.esJerarquico(numeroEmpleado) = 1)
);


CREATE TABLE EmpleadoNoProfesional(
	numeroEmpleado int primary key NOT NULL, 
	numeroNivel int NOT NULL,
	CONSTRAINT fk_NoProfesional_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_NoProfesional_nroNivel FOREIGN KEY(numeroNivel) REFERENCES NivelSeguridad(numeroNivel),
	CONSTRAINT checkEsNoProfesional CHECK(dbo.esNoProfesional(numeroEmpleado) = 1)
);


CREATE TABLE EmpleadoProfesional(
	numeroEmpleado int primary key NOT NULL, 
	contratacionProfesional nvarchar(20) NOT NULL,
	numeroEspecialidad int NOT NULL,
	CONSTRAINT fk_Profesional_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT contratacionValida CHECK( contratacionProfesional in ('contratado', 'permanente')),
	CONSTRAINT fk_Profesional_nroEspecialidad FOREIGN KEY(numeroEspecialidad) REFERENCES Especialidad(numeroEspecialidad),
	CONSTRAINT checkEsProfesional CHECK(dbo.esProfesional(numeroEmpleado) = 1)
);


CREATE TABLE EmpleadoPermanente(
	numeroEmpleado int primary key NOT NULL, 
	numeroArea int NOT NULL,
	CONSTRAINT fk_Permanente_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_Permanente_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT checkEsPermanente CHECK(dbo.esPermanente(numeroEmpleado) = 1)
);


CREATE TABLE EmpleadoContratado(
	numeroEmpleado int PRIMARY KEY NOT NULL,
	CONSTRAINT fk_Contratado_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT checkEsContratado CHECK(dbo.esContratado(numeroEmpleado) = 1)
);


CREATE TABLE DondeTrabajaC(
	numeroEmpleado int NOT NULL,
	fechaInicioTrabajo date NOT NULL, /* YYYY-MM-DD */
	fechaFinTrabajo date NOT NULL,
	numeroArea int NOT NULL,
	descripcionTrabajo nvarchar(50),
	PRIMARY KEY(numeroEmpleado, fechaInicioTrabajo),
	CONSTRAINT fk_DondeTrabajaC_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fk_DondeTrabajaC_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT descTrabajoVacio CHECK (descripcionTrabajo != ''),
	CONSTRAINT checkEstaLibre CHECK(dbo.EstaLibre(numeroEmpleado,fechaInicioTrabajo) = 1),
	CONSTRAINT fechasValidas CHECK (fechaFinTrabajo > fechaInicioTrabajo)
);


CREATE TABLE Auditoria(
	numeroEmpleado int NOT NULL,
	fechaInicioTrabajo date NOT NULL, /* YYYY-MM-DD */
	numeroAuditoria int identity NOT NULL,
	fechaHoraAuditoria datetime NOT NULL,
	resultadoAuditoria nvarchar(20),
	PRIMARY KEY(numeroEmpleado, fechaInicioTrabajo, numeroAuditoria),
	CONSTRAINT fk_Auditoria_nroEmpleado FOREIGN KEY(numeroEmpleado, fechaInicioTrabajo) REFERENCES DondeTrabajaC(numeroEmpleado, fechaInicioTrabajo),
	CONSTRAINT resultadoValido CHECK( resultadoAuditoria in( 'aprobado', 'desaprobado')),
	CONSTRAINT fechaAuditoriaValida CHECK (fechaHoraAuditoria < GETDATE())
);


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
);


create nonclustered index I_resultado on SeMueveEn(resultadoMov);


CREATE TABLE TieneAsignado(
	numeroEmpleado int NOT NULL, 
	numeroArea int NOT NULL,
	numeroFranja int NOT NULL,
	PRIMARY KEY(numeroArea, numeroEmpleado),
	CONSTRAINT fk_TieneAsignado_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES EmpleadoNoProfesional(numeroEmpleado),
	CONSTRAINT fk_TieneAsignado_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fk_TieneAsignado_nroFranja FOREIGN KEY(numeroFranja) REFERENCES FranjaHoraria(numeroFranja)
);
GO

-------------------- TRIGGERS --------------------

CREATE TRIGGER ControlNivelSeguridad
ON TIENEASIGNADO
FOR INSERT, UPDATE
AS 
	IF EXISTS (SELECT inserted.*
				FROM inserted,AREA A,EMPLEADONOPROFESIONAL ENP
				WHERE inserted.numeroEmpleado = ENP.numeroEmpleado AND inserted.numeroArea = A.numeroArea AND 
					ENP.numeroNivel != A.numeroNivel)
	BEGIN
		raiserror ('Los niveles de seguridad del Area y el Empleado no coinciden', 16, 1)
		rollback transaction
	END;
GO

CREATE TRIGGER ControlNSMov
ON SEMUEVEEN
FOR INSERT, UPDATE
AS

	IF EXISTS (SELECT inserted.* 
				FROM inserted,AREA A,NIVELSEGURIDAD NS
				WHERE inserted.numeroArea = A.numeroArea AND A.numeroNivel = NS.numeroNivel AND NS.tipoNivel = 'bajo')
	BEGIN
		raiserror ('El nivel de seguridad bajo no registra mov.', 16, 1)
		rollback transaction
	END;
GO

-------------------- VISTAS --------------------

CREATE VIEW IngresoFallido AS

SELECT E.*, A.*
FROM Empleado E, Area A
WHERE EXISTS (SELECT *
			  FROM SeMueveEn MOV1
			  WHERE MOV1.fechaHoraMov >= DATEADD(day, DATEDIFF(day,0,GETDATE()),0) AND -- día actual a las 00:00 hs.
					MOV1.numeroEmpleado = E.numeroEmpleado AND MOV1.numeroArea = A.numeroArea AND
					MOV1.resultadoMov = 'no autorizado' AND
					NOT EXISTS (SELECT *
								FROM SeMueveEn MOV2
								WHERE MOV2.fechaHoraMov >= MOV1.fechaHoraMov AND
									  MOV2.numeroEmpleado = E.numeroEmpleado AND MOV2.numeroArea = A.numeroArea AND
									  MOV2.tipoMov = 'ingreso' AND MOV2.resultadoMov = 'autorizado'
								)
			);
GO

-------------------- PROCEDURES --------------------

CREATE PROCEDURE IngresosNoAutorizados
	@CANT_DIAS INT,
	@INTENTOS INT
AS
BEGIN
	SELECT E.nombreEmpleado,E.apellidoEmpleado,E.funcionEmpleado
	FROM EMPLEADO E
	WHERE E.numeroEmpleado IN (SELECT ENP.numeroEmpleado
								FROM SEMUEVEEN SM,AREA A, EMPLEADONOPROFESIONAL ENP
								WHERE SM.resultadoMov = 'no autorizado' AND SM.numeroEmpleado = ENP.numeroEmpleado AND SM.numeroArea = A.numeroArea 
								AND A.numeroNivel > ENP.numeroNivel )
		  OR E.numeroEmpleado IN (  SELECT SME.numeroEmpleado
									FROM SEMUEVEEN SME
									WHERE SME.resultadoMov = 'no autorizado' AND E.numeroEmpleado = SME.numeroEmpleado 
									AND DATEDIFF(day, SME.fechaHoraMov,GETDATE()) < @CANT_DIAS
									GROUP BY SME.numeroEmpleado
									HAVING COUNT (*)>@INTENTOS)
END;
GO

CREATE PROCEDURE NoProfTodaArea
AS
BEGIN
	SELECT E.numeroEmpleado, E.nombreEmpleado, E.apellidoEmpleado
	FROM Empleado E, EmpleadoNoProfesional ENP
	WHERE E.numeroEmpleado = ENP.numeroEmpleado 
		  AND NOT EXISTS (SELECT *
						  FROM Area A
						  WHERE A.numeroNivel = ENP.numeroNivel AND 
							    NOT EXISTS (SELECT *
											FROM TieneAsignado T
											WHERE T.numeroArea = A.numeroArea
												  AND T.numeroEmpleado = ENP.numeroEmpleado
											)
						 )	
END;
GO