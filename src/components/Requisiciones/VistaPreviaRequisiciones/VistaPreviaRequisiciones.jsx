import { useState, useEffect } from 'react';
import { Alert, Button, Col, Row, Form, Container, Image, Badge, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faX, faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { map } from "lodash";
import "./VistaPreviaRequisiciones.scss";
import { listarPedidosVenta } from "../../../api/pedidoVenta";
import { obtenerNumeroRequisicion, actualizaRequisiciones, obtenerItem, obtenerRequisiciones } from "../../../api/requisicion";
import { obtenerRazonSocialPorNombre } from "../../../api/razonesSociales";
import { toast } from "react-toastify";
import BasicModal from "../../Modal/BasicModal";
import { getTokenApi, isExpiredToken, logoutApi, getSucursal } from "../../../api/auth";
import { LogsInformativos } from '../../Logs/LogsSistema/LogsSistema';
import LogoPDF from "../../../assets/png/pdf.png";
import Regreso from "../../../assets/png/back.png";
import 'dayjs/locale/es'
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function VistaPreviaRequisiciones(props) {
    const { setRefreshCheckLogin } = props;

    dayjs.locale('es') // use Spanish locale globally
    dayjs.extend(localizedFormat)

    // Cerrado de sesión automatico
    useEffect(() => {
        if (getTokenApi()) {
            if (isExpiredToken(getTokenApi())) {
                toast.warning("Sesión expirada");
                toast.success("Sesión cerrada por seguridad");
                logoutApi();
                setRefreshCheckLogin(true);
            }
        }
    }, []);
    // Termina cerrado de sesión automatico

    const params = useParams();
    const { id } = params

    // Para guardar los datos del formulario
    const [formData, setFormData] = useState(initialFormData());

    // Para guardar los datos del formulario
    const [formDataVenta, setFormDataVenta] = useState(initialFormDataVenta());

    // Para guardar los datos del formulario
    const [departamentoElegido, setDepartamentoElegido] = useState(initialDepartamento());

    // Para guardar los datos de los articulos
    const [formDataArticulos, setFormDataArticulos] = useState(initialFormDataArticulos());

    // Para la animacion del spinner
    const [loading, setLoading] = useState(false);

    const [listProductosCargados, setListProductosCargados] = useState([]);

    // Para definir el enrutamiento
    const enrutamiento = useNavigate()

    // Define la ruta de registro
    const rutaRegreso = () => {
        enrutamiento("/Requisiciones")
    }

    const [formDataSucursal, setFormDataSucursal] = useState(initialFormDataSucursalInitial());

    useEffect(() => {
        //
        obtenerRazonSocialPorNombre(getSucursal()).then(response => {
            const { data } = response;
            //console.log(data)
            setFormDataSucursal(initialFormDataSucursal(data));
        }).catch(e => {
            console.log(e)
        })
    }, [getSucursal()]);

    // Para almacenar la OV
    const [ordenVenta, setOrdenVenta] = useState("");
    // Para almacenar el cliente de la OV
    const [clienteOV, setClienteOV] = useState("");

    const [cantidadRequeridaOV, setCantidadRequeridaOV] = useState("");

    // Para almacenar la OV
    const [ordenVentaPrincipal, setOrdenVentaPrincipal] = useState("");

    const [producto, setProducto] = useState([]);

    // Para hacer uso del modal
    const [showModal, setShowModal] = useState(false);
    const [contentModal, setContentModal] = useState(null);
    const [titulosModal, setTitulosModal] = useState(null);

    // Para la eliminacion fisica de usuarios
    const buscarDepartamento = (content) => {
        setTitulosModal("Buscar departamento");
        setContentModal(content);
        setShowModal(true);
    }

    // Para la eliminacion fisica de usuarios
    const buscarMaterial = (content) => {
        setTitulosModal("Buscar material");
        setContentModal(content);
        setShowModal(true);
    }

    // Para la eliminacion fisica de usuarios
    const buscarInsumo = (content) => {
        setTitulosModal("Buscar insumo");
        setContentModal(content);
        setShowModal(true);
    }

    // Para la eliminacion fisica de usuarios
    const buscarOV = (content) => {
        setTitulosModal("Buscar Orden de Venta");
        setContentModal(content);
        setShowModal(true);
    }

    useEffect(() => {
        //
        obtenerRequisiciones(id).then(response => {
            const { data } = response;
            //console.log(data)
            setFormData(valoresAlmacenados(data))
            // setFechaCreacion(fechaElaboracion)
            setListProductosCargados(data.productosSolicitados)
        }).catch(e => {
            console.log(e)
        })
    }, []);

    // Para almacenar el listado de ordenes de venta
    const [listOrdenesVenta, setListOrdenesVenta] = useState(null);

    useEffect(() => {
        try {
            listarPedidosVenta().then(response => {
                const { data } = response;
                // console.log(data);
                if (!listOrdenesVenta && data) {
                    setListOrdenesVenta(formatModelOrdenesVenta(data));
                } else {
                    const datosOV = formatModelOrdenesVenta(data);
                    setListOrdenesVenta(datosOV);
                }

            }).catch((e) => {
                //console.log(e)
                if (e.message === "Network Error") {
                    toast.error("Conexión a Internet no Disponible");
                    // setConexionInternet(false);
                }
            })
        } catch (e) {
            console.log(e)
        }
    }, []);

    // Para agregar productos al listado
    const addItems = () => {
        const folio = document.getElementById("folio").value
        const cantidad = document.getElementById("cantidad").value
        const um = document.getElementById("um").value
        const descripcion = document.getElementById("descripcion").value
        const referencia = document.getElementById("referencia").value
        const precioUnitario = document.getElementById("precioUnitario").value

        if (!cantidad || !um || !descripcion || !precioUnitario || !referencia) {
            toast.warning("Completa la informacion del producto");
        } else {
            const dataTemp = {
                folio: folio,
                cantidad: cantidad,
                um: um,
                descripcion: descripcion,
                referencia: referencia,
                precioUnitario: precioUnitario,
                subtotal: parseFloat(precioUnitario) * parseFloat(cantidad)
            }

            setListProductosCargados(
                [...listProductosCargados, dataTemp]
            );

            setFormDataArticulos(initialFormDataArticulos)
            setFormDataVenta(initialFormDataVenta);
            //setCargaProductos(initialFormDataProductos)
            document.getElementById("cantidad").value = "0"
            setOrdenVenta("")
        }
    }

    // Para limpiar el formulario de detalles de producto
    const cancelarCargaProducto = () => {
        //setCargaProductos(initialFormDataProductos)
        setFormDataArticulos(initialFormDataArticulos)
        setFormDataVenta(initialFormDataVenta);
        //setCargaProductos(initialFormDataProductos)
        document.getElementById("cantidad").value = "0"
        setOrdenVenta("")
    }

    // Para eliminar productos del listado
    const removeItem = (producto) => {
        let newArray = listProductosCargados;
        newArray.splice(newArray.findIndex(a => a.descripcion === producto.descripcion), 1);
        setListProductosCargados([...newArray]);
    }
    // Termina gestión de los articulos cargados

    // Para almacenar el folio actual
    const [folioActual, setFolioActual] = useState("");

    useEffect(() => {
        try {
            obtenerNumeroRequisicion().then(response => {
                const { data } = response;
                console.log(data)
                const { noRequisicion } = data;
                setFolioActual(noRequisicion)
            }).catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    }, []);

    const onSubmit = (e) => {
        e.preventDefault()

        if (!formData.solicitante || !formData.fechaElaboracion) {
            toast.warning("Completa el formulario");
        } else {

            setLoading(true)

            // console.log(dataTemp)
            try {
                const dataTemp = {
                    fechaElaboracion: formData.fechaElaboracion,
                    fechaRequisicion: formData.fechaRequisicion,
                    solicitante: formData.solicitante,
                    aprobo: formData.aprobo,
                    comentarios: formData.comentarios,
                    departamento: departamentoElegido.departamento == "" ? formData.departamento : departamentoElegido.departamento,
                    tipoRequisicion: formData.tipoRequisicion,
                    tipoAplicacion: formData.tipoAplicacion,
                    productosSolicitados: listProductosCargados,
                }
                // console.log(data)
                actualizaRequisiciones(id, dataTemp).then(response => {
                    const { data: { mensaje, datos } } = response;
                    // console.log(response)
                    LogsInformativos("Se ha actualizado la requisición " + id, dataTemp);
                    toast.success(mensaje)
                    //LogsInformativos(`Se han actualizado los datos de la orden de compra con folio ${data.noCompra}`, datos)
                    setLoading(false)
                    rutaRegreso()
                }).catch(e => {
                    console.log(e)
                })
            } catch (e) {
                console.log(e)
            }
        }
    }

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setFormDataArticulos({ ...formDataArticulos, [e.target.name]: e.target.value })
    }

    // Calcula el subtotal de la lista de artículos cargados
    const subTotal = listProductosCargados.reduce((amount, item) => (amount + parseInt(item.subtotal)), 0);

    const renglon = listProductosCargados.length + 1;

    const dataPrincipal = () => {
        let newArray = [];
        listProductosCargados.map((detalle, index) => {
            newArray.push([
                {
                    text: index + 1,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: detalle.folio,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: detalle.descripcion,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: detalle.cantidad,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: detalle.um,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: `${new Intl.NumberFormat('es-MX', {
                        style: "currency",
                        currency: "MXN"
                    }).format(detalle.precioUnitario)} MXN`,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: `${new Intl.NumberFormat('es-MX', {
                        style: "currency",
                        currency: "MXN"
                    }).format(detalle.subtotal)} MXN`,
                    fontSize: 9,
                    bold: true,
                },
                {
                    text: detalle.referencia,
                    fontSize: 9,
                    bold: true,
                },
            ])
        });
        return newArray;
    };

    const list = dataPrincipal();

    const descargaPDF = async () => {

        const docDefinition = {

            content: [
                {
                    alignment: 'center',
                    style: 'header',
                    image: `data:image/png;base64,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`
                },
                {
                    margin: [0, 0, 0, 10],
                    table: {
                        widths: ['50%', '50%'],
                        heights: [10, 30],
                        body: [
                            [
                                {
                                    text: `RFC:  ${formDataSucursal.rfc}`,
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: `Razón social:  ${getSucursal()}`,
                                    fontSize: 9,
                                    bold: true,
                                }
                            ],
                            [
                                {
                                    text: `Dirección:  ${formDataSucursal.calle + " #" + formDataSucursal.numeroExterior + " COL " + formDataSucursal.colonia + ", " + formDataSucursal.municipio + ", " + formDataSucursal.estado}`,
                                    fontSize: 9,
                                    colSpan: 2,
                                    bold: true
                                },
                                {
                                }
                            ],
                        ],
                    }
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['25%', '25%', '25%', '25%'],
                        heights: [10, 10, 10, 10, 10, 30],
                        headerRows: 1,
                        body: [
                            [
                                {
                                    text: `Requisición:  ${formData.folio}`,
                                    fontSize: 9,
                                    colSpan: 2,
                                    bold: true
                                },
                                {
                                },
                                {
                                    text: `Departamento:  ${departamentoElegido.departamento == "" ? formData.departamento : departamentoElegido.departamento}`,
                                    fontSize: 9,
                                    colSpan: 2,
                                    bold: true,
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: `Tipo de aplicación:  ${formData.tipoAplicacion}`,
                                    colSpan: 2,
                                    bold: true,
                                    fontSize: 9
                                },
                                {
                                },
                                {
                                    text: `Tipo de requisición:  ${formData.tipoRequisicion}`,
                                    colSpan: 2,
                                    fontSize: 9,
                                    bold: true
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: `Fecha de elaboración:  ${dayjs(formData.fechaElaboracion).format("LL")}`,
                                    colSpan: 2,
                                    fontSize: 9,
                                    bold: true
                                },
                                {
                                },
                                {
                                    text: `Fecha de requisición:  ${dayjs(formData.fechaRequisicion).format("LL")}`,
                                    colSpan: 2,
                                    fontSize: 9,
                                    bold: true
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: [
                                        'Solicitante: ',
                                        {
                                            text: formData.solicitante,
                                            bold: false
                                        }
                                    ],
                                    colSpan: 2,
                                    fontSize: 9,
                                    bold: true
                                },
                                {
                                },
                                {
                                    text: [
                                        'Productos: ',
                                        {
                                            text: listProductosCargados.length,
                                            bold: false
                                        }
                                    ],
                                    colSpan: 2,
                                    fontSize: 9,
                                    bold: true
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: `Aprobo:  ${formData.aprobo}`,
                                    fontSize: 9,
                                    colSpan: 4,
                                    bold: true
                                },
                                {
                                },
                                {
                                },
                                {
                                }
                            ],
                            [
                                {
                                    text: `Comentarios:  ${formData.comentarios}`,
                                    fontSize: 9,
                                    colSpan: 4,
                                    bold: true
                                },
                                {
                                },
                                {
                                },
                                {
                                }
                            ],
                        ]
                    }
                },
                {
                    alignment: 'center',
                    text: 'Listado de artículos seleccionados',
                    style: 'header',
                    fontSize: 23,
                    bold: true,
                    margin: [0, 10],
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'],
                        heights: [10],
                        body: [
                            [
                                {
                                    text: '#',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Folio',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Descripción',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Cantidad',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'UM',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Precio',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Subtotal',
                                    fontSize: 9,
                                    bold: true,
                                },
                                {
                                    text: 'Referencia',
                                    fontSize: 9,
                                    bold: true,
                                }
                            ],
                        ],
                    }
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'],
                        heights: [10],
                        body:
                            list,
                    }
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['100%'],
                        heights: [10],
                        body: [
                            [
                                {
                                    text: `Valor total sin IVA:  ${new Intl.NumberFormat('es-MX', {
                                        style: "currency",
                                        currency: "MXN"
                                    }).format(subTotal)} MXN`,
                                    fontSize: 9,
                                    bold: true
                                },
                            ],
                        ],
                    }
                },
            ],
        };

        const pdf = pdfMake.createPdf(docDefinition);
        pdf.download(`${formData.folio}.pdf`);

    }

    return (
        <>
            <Alert>
                <Row>
                    <Col xs={12} md={8}>
                        <h1>
                            Detalles de la requisición
                        </h1>
                    </Col>
                    <Col xs={6} md={4}>
                        <Button
                            className="btnRegistroVentas"
                            title="Regresar a la pagina anterior"
                            onClick={() => {
                                rutaRegreso()
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowCircleLeft} /> Regresar
                        </Button>
                    </Col>
                </Row>
            </Alert>

            <Container>
                <Form onChange={onChange} onSubmit={onSubmit}>
                    <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Folio
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Escribe el folio"
                                name="folio"
                                value={formData.folio}
                                disabled
                            >
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Fecha de elaboración
                            </Form.Label>
                            <Form.Control
                                type="date"
                                placeholder="Escribe la fecha"
                                name="fechaElaboracion"
                                defaultValue={formData.fechaElaboracion}
                                disabled
                            >
                            </Form.Control>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Solicitante
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Escribe solicitante"
                                name="solicitante"
                                defaultValue={formData.solicitante}
                                disabled
                            >
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Departamento
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Escribe el departamento"
                                name="departamento"
                                value={departamentoElegido.departamento == "" ? formData.departamento : departamentoElegido.departamento}
                                disabled
                            >
                            </Form.Control>
                        </Form.Group>
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Tipo de requisicion
                            </Form.Label>
                            <Form.Control
                                as="select"
                                name="tipoRequisicion"
                                defaultValue={formData.tipoRequisicion}
                                disabled
                            >
                                <option >Elige....</option>
                                <option value="Materiales" selected={formData.tipoRequisicion == "Materiales"}>Materiales</option>
                                <option value="Insumos" selected={formData.tipoRequisicion == "Insumos"}>Insumos</option>
                            </Form.Control>
                        </Form.Group>

                        {formData.tipoRequisicion == "Materiales" && (
                            <>
                                <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                                    <Form.Label>
                                        Tipo de Aplicacion
                                    </Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="tipoAplicacion"
                                        defaultValue={formData.tipoAplicacion}
                                        disabled
                                    >
                                        <option >Elige....</option>
                                        <option value="Orden Venta" selected={formData.tipoAplicacion == "Orden Venta"}>Orden venta</option>
                                        <option value="Stock" selected={formData.tipoAplicacion == "Stock"}>Stock</option>
                                    </Form.Control>
                                </Form.Group>
                            </>
                        )}
                    </Row>

                    <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                ¿Cuando se require?
                            </Form.Label>
                            <Form.Control
                                type="date"
                                placeholder="Escribe la fecha"
                                name="fechaRequisicion"
                                defaultValue={formData.fechaRequisicion}
                                disabled
                            >
                            </Form.Control>
                        </Form.Group>
                    </Row>

                    <hr />

                    <Badge bg="secondary" className="tituloFormularioDetalles">
                        <h4>Listado de artículos agregados</h4>
                    </Badge>
                    <br />
                    <hr />
                    {/* Inicia tabla informativa del listado de articulos */}
                    <table className="responsive-tableRegistroVentas"
                    >
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Folio</th>
                                <th scope="col">Descripcion</th>
                                <th scope="col">UM</th>
                                <th scope="col">Cantidad</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Subtotal</th>
                                <th scope="col">Referencia</th>
                            </tr>
                        </thead>
                        <tfoot>
                        </tfoot>
                        <tbody>
                            {map(listProductosCargados, (producto, index) => (
                                <tr key={index}>
                                    <td scope="row">
                                        {index + 1}
                                    </td>
                                    <td data-title="Folio">
                                        {producto.folio}
                                    </td>
                                    <td data-title="Cantidad">
                                        {producto.descripcion}
                                    </td>
                                    <td data-title="UM">
                                        {producto.um}
                                    </td>
                                    <td data-title="Descripción">
                                        {producto.cantidad}
                                    </td>
                                    <td data-title="Precio unitario">
                                        <>
                                            {producto.precioUnitario ? new Intl.NumberFormat('es-MX', {
                                                style: "currency",
                                                currency: "MXN"
                                            }).format(producto.precioUnitario) : "No disponible"}
                                            { } MXN
                                        </>
                                    </td>
                                    <td data-title="Subtotal">
                                        <>
                                            {producto.subtotal ? new Intl.NumberFormat('es-MX', {
                                                style: "currency",
                                                currency: "MXN"
                                            }).format(producto.subtotal) : "No disponible"}
                                            { } MXN
                                        </>
                                    </td>
                                    <td data-title="Referencia">
                                        {producto.referencia}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Termina tabla informativa del listado de articulos */}

                    <Row>
                        <Col xs={12} md={8}>
                        </Col>
                        <Col xs={6} md={4}>
                            {/* Subtotal */}
                            <Row>
                                <Col>Valor total sin IVA</Col>
                                <Col>
                                    {new Intl.NumberFormat('es-MX', {
                                        style: "currency",
                                        currency: "MXN"
                                    }).format(subTotal)} MXN
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <hr />
                    <Badge bg="secondary" className="tituloFormularioDetalles">
                        <h4>Para uso exclusivo del departamento de compras</h4>
                    </Badge>

                    <Row className="mb-3">
                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Aprobo
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Escribe aprobador"
                                name="aprobo"
                                defaultValue={formData.aprobo}
                                disabled
                            //disabled={departamentoUsuario !== "Compras"}
                            >
                            </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} className="mb-3" controlId="formHorizontalNumeroInterno">
                            <Form.Label>
                                Comentarios
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Escribe el departamento"
                                name="comentarios"
                                defaultValue={formData.comentarios}
                                style={{ height: '100px' }}
                                disabled
                            //disabled={departamentoUsuario !== "Compras"}
                            >
                            </Form.Control>
                        </Form.Group>
                    </Row>

                    <br />
                    <div className="botones">
                        <Form.Group as={Row} className="botones">
                            <Row>
                                <Col>
                                    <div
                                        className="generacionPDF"
                                    >
                                        <Image
                                            src={LogoPDF}
                                            className="logoPDF"
                                            onClick={() => {
                                                descargaPDF()
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col>
                                    <div
                                        className="regreso"
                                    >
                                        <Image
                                            src={Regreso}
                                            className="regresarVistaAnterior"
                                            onClick={() => {
                                                rutaRegreso()
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Form.Group>
                    </div>
                </Form>
            </Container>

            <BasicModal show={showModal} setShow={setShowModal} title={titulosModal}>
                {contentModal}
            </BasicModal>
        </>
    );
}

function initialFormDataSucursalInitial() {
    return {
        rfc: "",
        calle: "",
        numeroExterior: "",
        numeroInterior: "",
        colonia: "",
        municipio: "",
        estado: "",
        pais: "",
        codigoPostal: ""
    }
}

function initialFormDataSucursal(data) {
    const { rfc, direccion } = data;

    return {
        rfc: rfc,
        calle: direccion.calle,
        numeroExterior: direccion.numeroExterior,
        numeroInterior: direccion.numeroInterior,
        colonia: direccion.colonia,
        municipio: direccion.municipio,
        estado: direccion.estado,
        pais: direccion.pais,
        codigoPostal: direccion.codigoPostal
    }
}

function initialFormDataVenta() {
    return {
        ordenVenta: "",
    }
}

function initialFormData() {
    return {
        folio: "",
        fechaElaboracion: "",
        fechaRequisicion: "",
        solicitante: "",
        aprobo: "",
        departamento: "",
        tipoRequisicion: "",
        tipoAplicacion: "",
        estado: "",
        comentarios: "",
    }
}

function initialDepartamento() {
    return {
        departamento: ""
    }
}

function valoresAlmacenados(data) {
    return {
        folio: data.folio,
        fechaElaboracion: data.fechaElaboracion,
        fechaRequisicion: data.fechaRequisicion,
        solicitante: data.solicitante,
        aprobo: data.aprobo,
        tipoRequisicion: data.tipoRequisicion,
        tipoAplicacion: data.tipoAplicacion,
        departamento: data.departamento,
        estado: data.estado,
        comentarios: data.comentarios,
    }
}

function initialFormDataArticulos() {
    return {
        folio: "",
        cantidad: "",
        um: "",
        descripcion: "",
        referencia: "",
        proveedor: "",
        precioUnitario: ""
    }
}

function formatModelProveedores(data) {
    const dataTemp = []
    data.forEach(data => {
        dataTemp.push({
            id: data._id,
            folio: data.folio,
            nombre: data.nombre,
            tipo: data.tipo,
            productoServicio: data.productoServicio,
            categoria: data.categoria,
            personalContacto: data.personalContacto,
            telefono: data.telefono,
            correo: data.correo,
            tiempoCredito: data.tiempoCredito,
            tiempoRespuesta: data.tiempoRespuesta,
            lugarRecoleccion: data.lugarRecoleccion,
            horario: data.horario,
            comentarios: data.comentarios,
            estado: data.estado,
            fechaCreacion: data.createdAt,
            fechaActualizacion: data.updatedAt
        });
    });
    return dataTemp;
}

function formatModelOrdenesVenta(data) {
    //console.log(data)
    const dataTemp = []
    data.forEach(data => {
        dataTemp.push({
            id: data._id,
            folio: data.folio,
            fechaElaboracion: data.fechaElaboracion,
            entrega: data.entrega,
            cliente: data.cliente,
            credito: data.credito,
            recibe: data.recibe,
            condicionesGenerales: data.condicionesGenerales,
            tiemposEntrega: data.tiemposEntrega,
            lugarEntrega: data.lugarEntrega,
            productos: data.productos,
            status: data.status,
            fechaRegistro: data.createdAt,
            fechaActualizacion: data.updatedAt
        });
    });
    return dataTemp;
}

export default VistaPreviaRequisiciones;
