import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Container, Form, Button } from "react-bootstrap"
import "./BuscarClientes.scss"
import styled from 'styled-components';
import DataTable from 'react-data-table-component';
import { estilos } from "../../../utils/tableStyled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownLong, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

function BuscarClientes(props) {
    const { setFormData, setDirecciones, setShowModal, listClientes } = props;

    // Cancelar y cerrar el formulario
    const cancelarBusqueda = () => {
        setShowModal(false)
    }

    // Gestionar el socio seleccionado
    const clienteElegido = ({ id, nombre, calle, numeroExterior, colonia, municipio, estado, domiciliosEntrega }) => {
        // Almacena id, ficha y nombre del socio elegido
        const dataTemp = {
            cliente: id,
            nombreCliente: nombre,
            lugarEntrega: calle + ", " + numeroExterior + ", " + colonia + ", " + municipio + ", " + estado
        }

        setFormData(dataTemp);
        setDirecciones(domiciliosEntrega);
        cancelarBusqueda();
    }


    const columns = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: 'RFC',
            selector: row => row.rfc,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: 'Correo',
            selector: row => row.correo,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: 'Telefono celular',
            selector: row => row.telefonoCelular,
            sortable: false,
            center: true,
            reorder: false
        },
        {
            name: "Seleccionar",
            selector: row => (
                <>
                    <FontAwesomeIcon
                        className="eleccion"
                        icon={faCircleCheck}
                        onClick={() => {
                            clienteElegido(row);
                        }}
                    />
                </>
            ),
            sortable: false,
            center: true,
            reorder: false
        },
    ];

    // Configurando animacion de carga
    const [pending, setPending] = useState(true);
    const [rows, setRows] = useState([]);

    const cargarDatos = () => {
        const timeout = setTimeout(() => {
            setRows(listClientes);
            setPending(false);
        }, 0);
        return () => clearTimeout(timeout);
    }


    useEffect(() => {
        cargarDatos();
    }, []);

    const paginationComponentOptions = {
        rowsPerPageText: 'Filas por página',
        rangeSeparatorText: 'de'
    };


    const [filterText, setFilterText] = useState("");
    const [resetPaginationToogle, setResetPaginationToogle] = useState(false);

    // Defino barra de busqueda
    const ClearButton = styled(Button)` 
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        height: 34px;
        width: 32px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
    `;


    const filteredItems = listClientes.filter(
        item => item.nombre && item.nombre.toLowerCase().includes(filterText.toLowerCase()) || item.rfc && item.rfc.toLowerCase().includes(filterText.toLowerCase())
    );

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToogle(!resetPaginationToogle);
                setFilterText('');
            }
        };

        return (
            <>
                <Col>
                    <Form.Control
                        id="search"
                        type="text"
                        placeholder="Busqueda por nombre del cliente o RFC"
                        aria-label="Search Input"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </Col>
                <Col>
                    <ClearButton
                        type="button"
                        title="Limpiar la busqueda"
                        onClick={handleClear}>
                        X
                    </ClearButton>
                </Col>
            </>
        );
    }, [filterText, resetPaginationToogle]);

    return (
        <>
            <Container fluid>
                <DataTable
                    noDataComponent="No hay registros para mostrar"
                    columns={columns}
                    data={filteredItems}
                    //actions={descargaCSV}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    progressPending={pending}
                    customStyles={estilos}
                    sortIcon={<FontAwesomeIcon icon={faArrowDownLong} />}
                    pagination
                    paginationComponentOptions={paginationComponentOptions}
                    paginationResetDefaultPage={resetPaginationToogle}
                />
                <Form.Group as={Row} className="botones">
                    <Col>
                        <Button
                            variant="danger"
                            title="Cerrar el formulario"
                            className="cancelar"
                            onClick={() => {
                                cancelarBusqueda()
                            }}
                        >
                            Cancelar
                        </Button>
                    </Col>
                </Form.Group>

            </Container>
        </>
    );
}

export default BuscarClientes;
