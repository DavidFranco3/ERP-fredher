import { useState, useEffect } from 'react';
import { Alert, Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { useHistory, withRouter } from "react-router-dom";

function FichaTecnica(props) {
    const { setRefreshCheckLogin } = props;

    // Para definir el enrutamiento
    const enrutamiento = useHistory()

    // Define la ruta de registro
    const rutaRegistro = () => {
        enrutamiento.push("/RegistroFichaTecnica")
    }

    const rutaRegreso = () => {
        enrutamiento.push("/DashboardCalidad")
    }

    return (
        <>
                <Alert>
                    <Row>
                        <Col xs={12} md={8}>
                            <h1>
                                Fichas tecnicas
                            </h1>
                        </Col>
                        <Col xs={6} md={4}>
                            <Button
                                className="btnRegistroVentas"
                                title="Registrar una nueva ficha"
                                onClick={() => {
                                    rutaRegistro()
                                }}
                            >
                                <FontAwesomeIcon icon={faCirclePlus} /> Registrar
                            </Button>
                            <Button
                                className="btnRegistroVentas"
                                title="Regresar al menú calidad"
                                onClick={() => {
                                    rutaRegreso()
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowCircleLeft} /> Regresar
                            </Button>
                        </Col>
                    </Row>
                </Alert>
        </>
    );
}

export default withRouter(FichaTecnica);
