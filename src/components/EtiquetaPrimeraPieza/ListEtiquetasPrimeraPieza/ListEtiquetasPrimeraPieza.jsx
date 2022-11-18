import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import moment from "moment";
import { Badge, Button, Container } from "react-bootstrap";
import { map } from "lodash";
import BasicModal from "../../Modal/BasicModal";
import EliminacionEtiquetasPrimeraPieza from "../EliminacionEtiquetasPrimeraPieza";
import ModificacionEtiquetaPrimeraPieza from "../ModificacionEtiquetaPrimeraPieza";
import styled from 'styled-components';
import DataTable from 'react-data-table-component';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownLong, faCircleInfo, faPenToSquare, faTrashCan, faEye, faArrowPointer } from "@fortawesome/free-solid-svg-icons";
import "./ListEtiquetasPrimeraPieza.scss";
import ClienteAsignado from "./ClienteAsignado";
import ProductoAsignado from "./ProductoAsignado"
import { estilos } from "../../../utils/tableStyled";

function ListEtiquetasPrimeraPieza(props) {
    const { setRefreshCheckLogin, listEtiquetas, history, location, rowsPerPage, setRowsPerPage, page, setPage, noTotalEtiquetas } = props;

    const enrutamiento = useHistory();

    // Definicion de la paginacion
    const handlePageChange = (page) => {
        setPage(page)
    }

    const handlePerRowsChange = (newPerPage, page) => {
        setRowsPerPage(newPerPage)
    }

    //console.log(listPedidosVenta)

    moment.locale("es");

    // Para hacer uso del modal
    const [showModal, setShowModal] = useState(false);
    const [contentModal, setContentModal] = useState(null);
    const [titulosModal, setTitulosModal] = useState(null);

    // Para la eliminacion fisica de usuarios
    const eliminacionEtiqueta = (content) => {
        setTitulosModal("Eliminar");
        setContentModal(content);
        setShowModal(true);
    }

    // Para la eliminacion fisica de usuarios
    const modificacionEtiqueta = (content) => {
        setTitulosModal("Modificar");
        setContentModal(content);
        setShowModal(true);
    }

    // Para abrir en una pestaña nueva el pdf de la vista
    const vistaPrevia = () => {
        // enrutamiento.push("")
    }

    const columns = [
        {
            name: "Folio",
            selector: row => row.folio,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Fecha",
            selector: row => moment(row.fecha).format('LL'),
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "No. Maquina",
            selector: row => row.noMaquina,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Producto",
            selector: row => (
                <>
                    <ProductoAsignado
                        id={row.descripcionProducto}
                    />
                </>
            ),
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Cliente",
            selector: row => (
                <>
                    <ClienteAsignado
                        id={row.cliente}
                    />
                </>
            ),
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Peso",
            selector: row => row.peso,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Turno",
            selector: row => row.turno,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "No. Cavidades",
            selector: row => row.noCavidades,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Inspector",
            selector: row => row.inspector,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Supervisor",
            selector: row => row.supervisor,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Ultima modificacion",
            selector: row => moment(row.fechaActualizacion).format('LL'),
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Acciones",
            center: true,
            reorder: true,
            selector: row => (
                <>
                    <Badge
                        bg="success"
                        className="editar"
                        onClick={() => {
                            modificacionEtiqueta(
                                <ModificacionEtiquetaPrimeraPieza
                                    data={row}
                                    setShowModal={setShowModal}
                                    history={history}
                                />)
                        }}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-lg" />
                    </Badge>
                    <Badge
                        bg="danger"
                        className="eliminar"
                        onClick={() => {
                            eliminacionEtiqueta(
                                <EliminacionEtiquetasPrimeraPieza
                                    data={row}
                                    setShowModal={setShowModal}
                                    history={history}
                                />)
                        }}
                    >
                        <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
                    </Badge>
                </>
            )
        }
    ];

    // Configurando animacion de carga
    const [pending, setPending] = useState(true);
    const [rows, setRows] = useState([]);


    useEffect(() => {
        const timeout = setTimeout(() => {
            setRows(listEtiquetas);
            setPending(false);
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    const paginationComponentOptions = {
        rowsPerPageText: 'Filas por página',
        rangeSeparatorText: 'de'
    };

    const [resetPaginationToogle, setResetPaginationToogle] = useState(false);

    return (
        <>
            <Container fluid>
                <DataTable
                    columns={columns}
                    // actions={descargaCSV}
                    data={listEtiquetas}
                    // expandableRows
                    // expandableRowsComponent={ExpandedComponent}
                    progressPending={pending}
                    pagination
                    paginationComponentOptions={paginationComponentOptions}
                    paginationResetDefaultPage={resetPaginationToogle}
                    paginationServer
                    paginationTotalRows={noTotalEtiquetas}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    customStyles={estilos}
                    sortIcon={<FontAwesomeIcon icon={faArrowDownLong} />}
                />
            </Container>

            <BasicModal show={showModal} setShow={setShowModal} title={titulosModal}>
                {contentModal}
            </BasicModal>
        </>
    );
}

export default ListEtiquetasPrimeraPieza;
