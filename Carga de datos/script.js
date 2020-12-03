const config = require('./config.json');
const loteDatos = require('./lote_datos.json');

const sql = require('mssql')
const poolPromise = sql.connect(config)


const INSERT_ESPECIALIDAD = "INSERT INTO Especialidad(nombreEspecialidad) VALUES ";
const INSERT_NIVELSEG = "INSERT INTO NivelSeguridad(tipoNivel) VALUES ";
const INSERT_FRANJAHORARIA = "INSERT INTO FranjaHoraria(horaInicio, horaFin) VALUES ";
const INSERT_AREA = "INSERT INTO Area(nombreArea, numeroNivel) VALUES ";
const INSERT_EVENTO = "INSERT INTO Evento(numeroArea, descripcionEvento, fechaHoraEvento) VALUES ";
const INSERT_EMPLEADO = "INSERT INTO Empleado(nombreEmpleado, apellidoEmpleado, funcionEmpleado, contrasena, huellaDactilar) VALUES ";
const INSERT_EMPLEADO_JER = "INSERT INTO EmpleadoJerarquico(numeroEmpleado, fechaInicio, numeroArea) VALUES ";
const INSERT_EMPLEADO_PROF = "INSERT INTO EmpleadoProfesional(numeroEmpleado, contratacionProfesional, numeroEspecialidad) VALUES ";
const INSERT_EMPLEADO_NOPROF = "INSERT INTO EmpleadoNoProfesional(numeroEmpleado, numeroNivel) VALUES ";
const INSERT_EMPLEADO_CONT = "INSERT INTO EmpleadoContratado(numeroEmpleado) VALUES ";
const INSERT_EMPLEADO_PERM = "INSERT INTO EmpleadoPermanente(numeroEmpleado, numeroArea) VALUES ";
const INSERT_DONDETRABAJAC = "INSERT INTO DondeTrabajaC(numeroEmpleado, fechaInicioTrabajo,fechaFinTrabajo,numeroArea,descripcionTrabajo) VALUES ";
const INSERT_AUDITORIA = "INSERT INTO Auditoria(numeroEmpleado, fechaInicioTrabajo, fechaHoraAuditoria, resultadoAuditoria) VALUES "
const INSERT_SEMUEVEEN = "INSERT INTO SeMueveEn(numeroArea,numeroEmpleado, fechaHoraMov, resultadoMov, tipoMov) VALUES ";
const INSERT_TIENEASIGNADO = "INSERT INTO TieneAsignado(numeroArea, numeroEmpleado, numeroFranja) VALUES ";

const SELECT_FK_NIVELES = "SELECT numeroNivel FROM NivelSeguridad;"
const SELECT_FK_AREAS = "SELECT numeroArea FROM Area;"
const SELECT_FK_EMPLEADOS = "SELECT * FROM Empleado;"
const SELECT_FK_ESPECIALIDAD = "SELECT numeroEspecialidad FROM Especialidad;"
const SELECT_DONDETRABAJAC = "SELECT numeroEmpleado, fechaInicioTrabajo FROM DondeTrabajaC"
const SELECT_FK_FRANJAS = "SELECT numeroFranja FROM FranjaHoraria";

const FINAL = ";"


async function main() {
    
    //Cantidades a generar
    const cantidadEmpleados = 50; //tener en cuenta que algunos pueden no ser aceptados y ojo que no pueden ser mas de 50
    const cantidadEventos = 25;
    const cantidadAuditorias = 5;
    const cantidadMovimientos = 30;
    const cantidadAsignaciones = 5;
   

    await poolPromise.then(async () => { //ya me conecte a la bd
        //Genero e inserto TODAS las especialidades
        const queryInsertEspecialidades = INSERT_ESPECIALIDAD + generarInsertMultipleEspecialidad() + FINAL;
        await sql.query(queryInsertEspecialidades).catch(err => {
            console.log("Error insertando especialidades: " + err);
        });
        console.log(queryInsertEspecialidades);
        console.log("Especialidades insertadas.")

        //Genero e inserto TODOS los niveles de seguridad
        const queryInsertNivelesSeg = INSERT_NIVELSEG + generarInsertMultipleNivelSeg() + FINAL;
        await sql.query(queryInsertNivelesSeg).catch(err => {
            console.log("Error insertando niveles de seguridad: " + err);
        });
        console.log(queryInsertNivelesSeg);
        console.log("Niveles de seguridad insertados.")

        //Genero e inserto TODAS las franjas horarias
        const queryInsertFranjas = INSERT_FRANJAHORARIA + generarInsertMultipleFranjas() + FINAL;
        await sql.query(queryInsertFranjas).catch(err => {
            console.log("Error insertando franjas horarias: " + err);
        });
        console.log(queryInsertFranjas);
        console.log("Franjas horarias insertadas.")

        //Genero e inserto TODAS las areas con niveles de seguridad random (dentro de los valores existentes)
        //Para eso primero debo recuperar las fk de la bd y guardarlo en arrayFK
        const arrayFKNiveles = await sql.query(SELECT_FK_NIVELES).then(result => {
            return result.recordset.map(a => a.numeroNivel);
        });
        const queryInsertAreas = INSERT_AREA + generarInsertMultipleArea(arrayFKNiveles) + FINAL;
        await sql.query(queryInsertAreas);
        console.log(queryInsertAreas);
        console.log("Areas insertadas.")

        //Genero e inserto N empleados
        await insertarEmpleados(cantidadEmpleados);
        console.log("Empleados insertados.")

        //Selecciono los empleados que se insertaron y creo el resto de tablas de empleados segun sus funciones
        //Para esto necesito 4 arrays: niveles (que ya los tengo)  y  areas,empleados y especialidades
        const arrayFKAreas = await sql.query(SELECT_FK_AREAS).then(result => {
            return result.recordset.map(a => a.numeroArea);
        });
        const arrayEmpleados = await sql.query(SELECT_FK_EMPLEADOS).then(result => {
            return result.recordset;
        });
        const arrayEspecialidades = await sql.query(SELECT_FK_ESPECIALIDAD).then(result => {
            return result.recordset.map(a => a.numeroEspecialidad);
        });

        await insertarFuncionesEmpleados(arrayEmpleados, arrayFKAreas, arrayFKNiveles, arrayEspecialidades);
        console.log("Funciones de los empleados insertados.")

        //Obtengo las areas para poder insertar N eventos
        await insertarEventos(cantidadEventos, arrayFKAreas);
        console.log("Eventos insertados.")

        //Genero e inserto N tuplas de Auditoria
        //Para esto debo recuperar las tuplas de DondeTrabajaC
        const arrayDondeTrabajaC = await sql.query(SELECT_DONDETRABAJAC).then(result => {
            return result.recordset;
        });
        await insertarAuditorias(cantidadAuditorias, arrayDondeTrabajaC);
        console.log("Auditorias insertadas.")

        //Genero e inserto tuplas de SeMueveEn
        await insertarSeMueveEn(cantidadMovimientos, arrayFKAreas, arrayEmpleados.map(a => a.numeroEmpleado));
        console.log("SeMueveEn insertados.")

        const arrayFranjas = await sql.query(SELECT_FK_FRANJAS).then(result => {
            return result.recordset.map(a => a.numeroFranja);
        });
        //Genero e inserto tuplas de TieneAsignado
        await insertarTieneAsignado(cantidadAsignaciones, arrayFKAreas, arrayEmpleados.map(a => a.numeroEmpleado), arrayFranjas);
        console.log("TieneAsignado insertados.");
    });
    process.exit();
}

async function testQuery(query) {
    await poolPromise.then(async () => { //ya me conecte a la bd
        const resultado = sql.query(query).then(result => {
            return result; //.recordset
        });
        console.log(resultado);
    });
    process.exit();
}

function insertarTieneAsignado(cantidadAsignaciones, arrayFKAreas, arrayEmpleados, arrayFranjas) {
    let i = 0;
    let resultadoAct;
    let queryAct;
    while (i < cantidadAsignaciones) {
        resultadoAct = generarTieneAsignado(arrayFKAreas, arrayEmpleados, arrayFranjas);
        queryAct = INSERT_TIENEASIGNADO + "(" + resultadoAct.numeroArea + "," + resultadoAct.numeroEmpleado +
            "," + resultadoAct.numeroFranja + ")" + FINAL;
        sql.query(queryAct).catch(err => {
            console.log("Error insertando TieneAsignado: " + err);
        });
        console.log(queryAct);
        i++;
    }
}

function insertarSeMueveEn(cantidadMovimientos, arrayAreas, arrayEmpleados) {
    let i = 0;
    let resultadoAct;
    let queryAct;
    while (i < cantidadMovimientos) {
        resultadoAct = generarSeMueveEn(arrayAreas, arrayEmpleados);
        queryAct = INSERT_SEMUEVEEN + "(" + resultadoAct.numeroArea + "," + resultadoAct.numeroEmpleado +
            ",'" + resultadoAct.fechaHoraMov + "','" + resultadoAct.resultadoMov + "','" + resultadoAct.tiposMov + "')" + FINAL;
        sql.query(queryAct).catch(err => {
            console.log("Error insertando SeMueveEn: " + err);
        });
        console.log(queryAct);
        i++;
    }
}

function insertarAuditorias(cantidadAuditorias, arrayDondeTrabajaC) {
    let i = 0;
    let resultadoAct;
    let queryAct;
    while (i < cantidadAuditorias) {
        resultadoAct = generarAuditoria(arrayDondeTrabajaC);
        queryAct = INSERT_AUDITORIA + "(" + resultadoAct.numeroEmpleado + ",'" + resultadoAct.fechaInicioTrabajo +
            "','" + resultadoAct.fechaHoraAuditoria + "','" + resultadoAct.resultadoAuditoria + "')" + FINAL;
        sql.query(queryAct).catch(err => {
            console.log("Error insertando auditoria: "+ err);
        });
        console.log(queryAct);
        i++;
    }
}

function insertarEventos(cantidadEventos, fkAreas) {
    let i = 0;
    let resultadoAct;
    let queryAct;
    while (i < cantidadEventos) {
        resultadoAct = generarEvento(fkAreas);
        queryAct = INSERT_EVENTO + "('" + resultadoAct.numeroArea + "','" + resultadoAct.descripcionEvento +
            "','" + resultadoAct.fechaHoraEvento + "')" + FINAL;
        sql.query(queryAct).catch(err => {
            console.log("Error insertando evento: " + err);
        });
        console.log(queryAct);
        i++;
    }
}

async function insertarEmpleados(cantidadEmpleados) {
    let i = 0;
    let resultadoAct;
    let queryAct;
    const huellas = loteDatos.hashes;
    while (i < cantidadEmpleados) {
        resultadoAct = generarEmpleado();
        queryAct = INSERT_EMPLEADO + "('" + resultadoAct.nombreEmpleado + "','" + resultadoAct.apellidoEmpleado +
            "','" + resultadoAct.funcionEmpleado + "','" + resultadoAct.contrasenaEmpleado + "','" +
            huellas[i] + "')" + FINAL;
        sql.query(queryAct).catch(err => {
            console.log("Error insertando empleado: " + err);
        });
        i++;
    }
}


async function insertarFuncionesEmpleados(arrayEmpleados, arrayFKAreas, arrayFKNiveles, arrayEspecialidades) {
    let i = 0;
    let queryAct;
    let empleadoAct, especialidadAct, contratProfAct, numeroAreaAct, numeroNivelAct, dondeTrabajaCact;
    const contrataciones = loteDatos.contratProf;
    while (i < arrayEmpleados.length) {
        empleadoAct = arrayEmpleados[i];
        if (empleadoAct.funcionEmpleado == "jerarquico") {
            numeroAreaAct = arrayFKAreas[Math.floor(Math.random() * arrayFKAreas.length)];
            fechaRandomPasada = randomDate(new Date(1980, 0, 1), new Date(), 0, 24);
            queryAct = INSERT_EMPLEADO_JER + "(" + empleadoAct.numeroEmpleado + ",'" + fechaRandomPasada.split(' ')[0] + "'," + numeroAreaAct + ")" + FINAL;
            sql.query(queryAct).catch(err => {
                console.log("Error insertando empleado jerarquico: " + err);
            });
            console.log(queryAct);
        }
        else if (empleadoAct.funcionEmpleado == "profesional") {
            contratProfAct = contrataciones[Math.floor(Math.random() * contrataciones.length)];
            especialidadAct = arrayEspecialidades[Math.floor(Math.random() * arrayEspecialidades.length)];
            queryAct = INSERT_EMPLEADO_PROF + "(" + empleadoAct.numeroEmpleado + ",'" + contratProfAct + "'," + especialidadAct + ")" + FINAL;
            sql.query(queryAct).catch(err => {
                console.log("Error insertando empleado profesional: " + err);
            });
            console.log(queryAct);
            if (contratProfAct == "contratado") {
                queryAct = INSERT_EMPLEADO_CONT + "(" + empleadoAct.numeroEmpleado + ")" + FINAL;
                sql.query(queryAct).catch(err => {
                    console.log("Error insertando empleado contratado: " + err);
                });
                console.log(queryAct);
                dondeTrabajaCact = generarDondeTrabajaC(arrayFKAreas);
                queryAct = INSERT_DONDETRABAJAC + "(" + empleadoAct.numeroEmpleado + ",'" + dondeTrabajaCact.fechaInicioTrabajo +
                    "','" + dondeTrabajaCact.fechaFinTrabajo + "'," + dondeTrabajaCact.numeroArea + ",'" + dondeTrabajaCact.descripcionTrabajo + "')" + FINAL;
                sql.query(queryAct).catch(err => {
                    console.log("Error insertando DondeTrabajaC: " + err);
                });
                console.log(queryAct);
            }
            else { //permanente
                numeroAreaAct = arrayFKAreas[Math.floor(Math.random() * arrayFKAreas.length)];
                queryAct = INSERT_EMPLEADO_PERM + "(" + empleadoAct.numeroEmpleado + "," + numeroAreaAct + ")" + FINAL;
                sql.query(queryAct).catch(err => {
                    console.log("Error insertando empleado permanente: " + err);
                });
                console.log(queryAct);
            }
        }
        else { //no prof
            numeroNivelAct = arrayFKNiveles[Math.floor(Math.random() * arrayFKNiveles.length)];
            queryAct = INSERT_EMPLEADO_NOPROF + "(" + empleadoAct.numeroEmpleado + "," + numeroNivelAct + ")" + FINAL;
            sql.query(queryAct).catch(err => {
                console.log("Error insertando empleado no profesional: " + err);
            });
            console.log(queryAct);
        }
        i++;
    }
}


function generarInsertMultipleEspecialidad() {
    const especialidades = loteDatos.especialidades;
    let resultado = ""
    let i = 1;
    while (i <= especialidades.length) {
        resultado += "('" + especialidades[i-1] + "'), ";
        i++;
    }
    return resultado.slice(0, -2); 
}

function generarInsertMultipleNivelSeg() {
    const niveles = loteDatos.niveles;
    let resultado = ""
    let i = 1;
    while (i <= niveles.length) {
        resultado += "('" + niveles[i - 1] + "'), ";
        i++;
    }
    return resultado.slice(0, -2);
}

function generarInsertMultipleFranjas() {
    const franjasHorarias = loteDatos.franjasHorarias;
    let resultado = ''
    let i = 1;
    while (i <= franjasHorarias.length) {
        resultado += "('" + franjasHorarias[i - 1].hInicio + "','" + franjasHorarias[i - 1].hFin + "'), ";
        i++;
    }
    return resultado.slice(0, -2);
}

function generarInsertMultipleArea(fkNiveles) {
    const areas = loteDatos.areas;
    let resultado = ''
    let i = 1;
    let randomNivel;
    while (i <= areas.length) {
        randomNivel = Math.floor(Math.random() * fkNiveles.length);
        resultado += "('" + areas[i - 1] + "'," + fkNiveles[randomNivel] + "), ";
        i++;
    }
    return resultado.slice(0, -2);
}

function generarTieneAsignado(arrayAreas, arrayEmpleados, arrayFranjas) {
    const randomFranja = arrayFranjas[Math.floor(Math.random() * arrayFranjas.length)];
    const randomEmpleado = arrayEmpleados[Math.floor(Math.random() * arrayEmpleados.length)];
    const randomArea = arrayAreas[Math.floor(Math.random() * arrayAreas.length)];
    let resultado = {
        "numeroArea": randomArea,
        "numeroEmpleado": randomEmpleado,
        "numeroFranja": randomFranja
    }
    return resultado;
}

function generarSeMueveEn(arrayAreas, arrayEmpleados) {
    const resultadosMov = loteDatos.resultadosMov;
    const tiposMov = loteDatos.tipoMov;
    const randomFechaHoraMov = randomDatetime27(new Date(1980, 0, 1), new Date(), 0, 24);
    const randomEmpleado = arrayEmpleados[Math.floor(Math.random() * arrayEmpleados.length)];
    const randomArea = arrayAreas[Math.floor(Math.random() * arrayAreas.length)];
    const randomTipo = tiposMov[Math.floor(Math.random() * tiposMov.length)];
    const randomResultado = resultadosMov[Math.floor(Math.random() * resultadosMov.length)];
    let resultado = {
        "numeroArea": randomArea,
        "numeroEmpleado": randomEmpleado,
        "fechaHoraMov": randomFechaHoraMov,
        "resultadoMov": randomResultado,
        "tiposMov": randomTipo
    }
    return resultado;
}


function generarAuditoria(arrayDondeTrabajaC) {
    const resultados = loteDatos.resultadosAud;
    const randomDondeTrabajaC = arrayDondeTrabajaC[Math.floor(Math.random() * arrayDondeTrabajaC.length)];
    let resultado = {
        "numeroEmpleado": randomDondeTrabajaC.numeroEmpleado,
        "fechaInicioTrabajo": formatDateToYMD(randomDondeTrabajaC.fechaInicioTrabajo),
        "fechaHoraAuditoria": randomDatetime(new Date(1980, 0, 1), new Date(), 0, 24),
        "resultadoAuditoria": resultados[Math.floor(Math.random() * resultados.length)]
    }
    return resultado;
}


function generarEvento(fkAreas) {
    const eventos = loteDatos.eventos;
    const randomArea = Math.floor(Math.random() * fkAreas.length);
    const randomString = Math.floor(Math.random() * eventos.strings.length);
    const randomComponente = Math.floor(Math.random() * eventos.componentes.length);
    let resultado = {
        "numeroArea": fkAreas[randomArea],
        "descripcionEvento": eventos.strings[randomString] + eventos.componentes[randomComponente],
        "fechaHoraEvento": randomDate(new Date(1980, 0, 1), new Date(), 0, 24),
    }
    return resultado;
}

function generarDondeTrabajaC(fkAreas) {
    componentes = loteDatos.eventos.componentes;
    fechaRandomInicio = randomDate(new Date(1980, 0, 1), new Date(), 0, 24);
    fechaRandomFin = randomDate(Date.parse(fechaRandomInicio), new Date(), 0, 24);
    let resultado = {
        "fechaInicioTrabajo": fechaRandomInicio.split(' ')[0],
        "fechaFinTrabajo": fechaRandomFin.split(' ')[0],
        "numeroArea": fkAreas[Math.floor(Math.random() * fkAreas.length)],
        "descripcionTrabajo": loteDatos.dondeTrabajaC + componentes[Math.floor(Math.random() * componentes.length)]
    }
    return resultado;
}


function generarEmpleado() {
    const nombres = loteDatos.nombres;
    const apellidos = loteDatos.apellidos;
    const funciones = loteDatos.funciones;
    const huellas = loteDatos.hashes;
    const contrasenas = loteDatos.contrasenas;
    const randomNombre = Math.floor(Math.random() * nombres.length);
    const randomApellido = Math.floor(Math.random() * apellidos.length);
    const randomFuncion = Math.floor(Math.random() * funciones.length);
    const randomHuella = Math.floor(Math.random() * huellas.length);
    const randomContrasena = Math.floor(Math.random() * contrasenas.length);
    let resultado = {
        "nombreEmpleado": nombres[randomNombre],
        "apellidoEmpleado": apellidos[randomApellido],
        "funcionEmpleado": funciones[randomFuncion],
        "contrasenaEmpleado": contrasenas[randomContrasena],
        "huellaDactilarEmpleado": huellas[randomHuella],
    }
    return resultado;
}


function randomDatetime27(start,end,startHour,endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    let res = date.toISOString().replace("T", " ");
    res = res.replace("Z", "000");
    return res;
}

function randomDate(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    const res = date.toISOString().replace("T"," ");
    return res.slice(0, -1); //Para quitar la Z
}

function randomDatetime(start, end, startHour, endHour) {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    const res = date.toISOString().replace("T", " ");
    return res.slice(0, -5); //Para quitar la Z y los milisegundos
}

function formatDateToYMD(date) {
    const res = date.toISOString();
    return res.split('T')[0];
}


main();
