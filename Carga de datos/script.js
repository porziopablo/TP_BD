const config = require('./config.json');
const loteDatos = require('./lote_datos.json');
const transacciones = require('./transacciones.json');
const sql = require('mssql')
const poolPromise = sql.connect(config)


const INSERT_ESPECIALIDAD = "INSERT INTO Especialidad(nombreEspecialidad) VALUES ";
const INSERT_NIVELSEG = "INSERT INTO NivelSeguridad(tipoNivel) VALUES ";
const INSERT_FRANJAHORARIA = "INSERT INTO FranjaHoraria(horaInicio, horaFin) VALUES ";
const INSERT_AREA = "INSERT INTO Area(nombreArea, numeroNivel) VALUES ";
const INSERT_EVENTO = "INSERT INTO Evento(numeroArea, descripcionEvento, fechaHoraEvento) VALUES ";
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
   

    await poolPromise.then(async (pool) => { //ya me conecte a la bd
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

        //Inserto empleados y creo el resto de tablas de empleados segun sus funciones
        //Para esto necesito 4 arrays: niveles (que ya los tengo)  y  areas y especialidades
        const arrayFKAreas = await sql.query(SELECT_FK_AREAS).then(result => {
            return result.recordset.map(a => a.numeroArea);
        });
        const arrayEspecialidades = await sql.query(SELECT_FK_ESPECIALIDAD).then(result => {
            return result.recordset.map(a => a.numeroEspecialidad);
        });
        await insertarEmpleados(pool, cantidadEmpleados, arrayFKAreas, arrayFKNiveles, arrayEspecialidades);
        console.log("Empleados y sus funciones insertados.")

        //Recupero array con empleados para uso posterior
        const arrayEmpleados = await sql.query(SELECT_FK_EMPLEADOS).then(result => {
            return result.recordset;
        });

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
        const resultado = await sql.query(query).then(result => {
            return result; //.recordset
        });
        console.log(resultado);
    }).catch(err => {
        console.log("ERROR " + err);
    });
    process.exit();
}

async function insertarEmpleados(pool, cantidadEmpleados, arrayFKAreas, arrayFKNiveles, arrayEspecialidades) {
    let i = 0;
    let resultadoAct, queryAct, randomAct, fechaRandomPasada, numeroAreaAct, especialidadAct, dondeTrabajaCact;
    const huellas = loteDatos.hashes;
    while (i < cantidadEmpleados) {
        randomAct = Math.floor(Math.random() * 4) + 1;
        console.log(randomAct);
        resultadoAct = generarEmpleado();
        switch (randomAct) {
            case 1:
                queryAct = transacciones.transaccionEmpleadoJerarquico;
                numeroAreaAct = arrayFKAreas[Math.floor(Math.random() * arrayFKAreas.length)];
                fechaRandomPasada = randomDate(new Date(1980, 0, 1), new Date(), 0, 24);
                await pool.request()
                    .input("input_nombre", sql.NVarChar(30), resultadoAct.nombreEmpleado)
                    .input("input_apellido", sql.NVarChar(30), resultadoAct.apellidoEmpleado)
                    .input("input_funcion", sql.NVarChar(20), "jerarquico")
                    .input("input_contrasena", sql.NVarChar(30), resultadoAct.contrasenaEmpleado)
                    .input("input_huella", sql.NVarChar(30), huellas[Math.floor(Math.random() * huellas.length)] + Math.floor(Math.random() * 1577).toString())
                    .input("input_fechaInicio", sql.Date, fechaRandomPasada)
                    .input("input_numeroArea", sql.Int, numeroAreaAct)
                    .query(queryAct).catch(err => {
                        console.log("Error en la transaccion empleado jerarquico: " + err);
                    });
                break;
            case 2:
                queryAct = transacciones.transaccionEmpleadoNoProf;
                numeroNivelAct = arrayFKNiveles[Math.floor(Math.random() * arrayFKNiveles.length)];
                await pool.request()
                    .input("input_nombre", sql.NVarChar(30), resultadoAct.nombreEmpleado)
                    .input("input_apellido", sql.NVarChar(30), resultadoAct.apellidoEmpleado)
                    .input("input_funcion", sql.NVarChar(20), "no profesional")
                    .input("input_contrasena", sql.NVarChar(30), resultadoAct.contrasenaEmpleado)
                    .input("input_huella", sql.NVarChar(30), huellas[Math.floor(Math.random() * huellas.length)] + Math.floor(Math.random() * 1577).toString())
                    .input("input_numeroNivel", sql.Int, numeroNivelAct)
                    .query(queryAct).catch(err => {
                        console.log("Error en la transaccion empleado no profesional: " + err);
                    });
                break;
            case 3:
                queryAct = transacciones.transaccionEmpleadoProfCont;
                numeroAreaAct = arrayFKAreas[Math.floor(Math.random() * arrayFKAreas.length)];
                fechaRandomPasada = randomDate(new Date(1980, 0, 1), new Date(), 0, 24);
                especialidadAct = arrayEspecialidades[Math.floor(Math.random() * arrayEspecialidades.length)];
                dondeTrabajaCact = generarDondeTrabajaC(arrayFKAreas);
                await pool.request()
                    .input("input_nombre", sql.NVarChar(30), resultadoAct.nombreEmpleado)
                    .input("input_apellido", sql.NVarChar(30), resultadoAct.apellidoEmpleado)
                    .input("input_funcion", sql.NVarChar(20), "profesional")
                    .input("input_contrasena", sql.NVarChar(30), resultadoAct.contrasenaEmpleado)
                    .input("input_huella", sql.NVarChar(30), huellas[Math.floor(Math.random() * huellas.length)] + Math.floor(Math.random() * 1577).toString())
                    .input("input_contratacionProfesional", sql.NVarChar(20), "contratado")
                    .input("input_numeroEspecialidad", sql.Int, especialidadAct)
                    .input("input_fechaInicioTrabajo", sql.Date, dondeTrabajaCact.fechaInicioTrabajo)
                    .input("input_fechaFinTrabajo", sql.Date, dondeTrabajaCact.fechaFinTrabajo)
                    .input("input_numeroArea", sql.Int, dondeTrabajaCact.numeroArea)
                    .input("input_descripcionTrabajo", sql.NVarChar(50), dondeTrabajaCact.descripcionTrabajo)
                    .query(queryAct).catch(err => {
                        console.log("Error en la transaccion empleado prof. contratado: " + err);
                    });
                break;
            case 4:
                queryAct = transacciones.transaccionEmpleadoProfPerm;
                numeroAreaAct = arrayFKAreas[Math.floor(Math.random() * arrayFKAreas.length)];
                especialidadAct = arrayEspecialidades[Math.floor(Math.random() * arrayEspecialidades.length)];
                await pool.request()
                    .input("input_nombre", sql.NVarChar(30), resultadoAct.nombreEmpleado)
                    .input("input_apellido", sql.NVarChar(30), resultadoAct.apellidoEmpleado)
                    .input("input_funcion", sql.NVarChar(20), "profesional")
                    .input("input_contrasena", sql.NVarChar(30), resultadoAct.contrasenaEmpleado)
                    .input("input_huella", sql.NVarChar(30), huellas[Math.floor(Math.random() * huellas.length)] + Math.floor(Math.random() * 1577).toString())
                    .input("input_contratacionProfesional", sql.NVarChar(20), "permanente")
                    .input("input_numeroEspecialidad", sql.Int, especialidadAct)
                    .input("input_numeroArea", sql.Int, numeroAreaAct)
                    .query(queryAct).catch(err => {
                        console.log("Error en la transaccion empleado prof. permanente: " + err);
                    });
                break;
        }

        i++;
    }
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
//testQuery("aa");