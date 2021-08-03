import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './modal.css'

export const ReleaseModal = (props) =>
	<Modal isOpen={props.visible} toggle={_ => props.toggleModal()}>
		<ModalHeader toggle={props.toggleModal}>Новый релиз приложения: {props.siteVersion}</ModalHeader>
		<ModalBody>
			<div className="modal-text-content">
				<ul>Изменения:
					<li>Внесены поправки в алгоритм расчета разгара горна</li>
					<li>Добавлено отображение самого "горячего" пояса и луча на индикаторах</li>
				</ul>
			</div>
			<div className="modal-text-img"></div><br />
			<div className="modal-text-content">Если это предупреждение появится еще раз, нажмите <span className="release">Ctrl+F5</span>.</div>
			<div className="modal-text-content">Желательно также очистить историю, изображения и другие файлы кэша браузера.</div>
		</ModalBody>
		<ModalFooter>
			<Button className="btn-sm" color="primary" onClick={_ => props.toggleModal()}>Ознакомлен</Button>{' '}
		</ModalFooter>
	</Modal>