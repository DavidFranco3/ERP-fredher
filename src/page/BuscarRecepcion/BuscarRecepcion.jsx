import { useState, useEffect, Suspense } from 'react';
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { useHistory, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
//import BuscarClientes from '../../components/Busquedas/BuscarClientes';
import { listarRecepcion } from "../../api/recepcionMaterialInsumos";
import "./BuscarRecepcion.scss"
import { getTokenApi, isExpiredToken, logoutApi, getSucursal } from "../../api/auth";
import Lottie from 'react-lottie-player';
import AnimacionLoading from '../../assets/json/loading.json';
import BuscarRecepciones from '../../components/Busquedas/BuscarRecepciones';

function BuscarRecepcion(props) {
    const { setFormData, formData, productosRecepcion, setProductosRecepcion, setShowModal, setRefreshCheckLogin, location, history } = props;

    const enrutamiento = useHistory();

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

    // Almacena los datos de la orden de venta
    const [listRecepciones, setListRecepciones] = useState(null);

    useEffect(() => {
        try {
            listarRecepcion(getSucursal()).then(response => {
                const { data } = response;

                //console.log(data);

                if (!listRecepciones && data) {
                    setListRecepciones(formatModelRecepciones(data));
                } else {
                    const datosRecepciones = formatModelRecepciones(data);
                    setListRecepciones(datosRecepciones);
                }
            }).catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    }, [location]);

    return (
        <>

            {
                listRecepciones ?
                    (
                        <>
                            <Suspense fallback={<Spinner />}>
                                <BuscarRecepciones
                                    listRecepciones={listRecepciones}
                                    setShowModal={setShowModal}
                                    location={location}
                                    history={history}
                                    setRefreshCheckLogin={setRefreshCheckLogin}
                                    formData={formData}
                                    setFormData={setFormData}
                                    productosRecepcion={productosRecepcion}
                                    setProductosRecepcion={setProductosRecepcion}
                                />
                            </Suspense>
                        </>
                    )
                    :
                    (
                        <>
                            <Lottie loop={true} play={true} animationData={AnimacionLoading} />
                        </>
                    )
            }
        </>
    );
}

function formatModelRecepciones(data) {
    //console.log(data)
    const dataTemp = []
    data.forEach(data => {
        dataTemp.push({
            id: data._id,
            ordenCompra: data.ordenCompra,
            sucursal: data.sucursal,
            proveedor: data.proveedor,
            nombreProveedor: data.nombreProveedor,
            folio: data.folio,
            fechaRecepcion: data.fechaRecepcion,
            precio: data.precio,
            cantidad: data.cantidad,
            productos: data.productos,
            valorTotal: data.valorTotal,
            fechaRegistro: data.createdAt,
            fechaActualizacion: data.updatedAt
        });
    });
    return dataTemp;
}

export default withRouter(BuscarRecepcion);
