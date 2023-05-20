import { Button, Modal, Tabs } from "react-bulma-components";
import styles from "./AddMenu.module.scss";
import { useRef, useState } from "react";
import NewCollection from "./NewCollection";
import AddBook from "./AddBook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export interface AddMenuProps {
  className?: string;
}

const AddMenu: React.FC = (props) => {
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const save = useRef<HTMLButtonElement>(null);

  // if (!save || !save.current) return <></>;

  return (
    <>
      <Modal show={show} closeOnEsc onClose={() => setShow(false)}>
        <Modal.Card>
          <Modal.Card.Header>
            <Modal.Card.Title>Add Menu</Modal.Card.Title>
          </Modal.Card.Header>
          <Modal.Card.Body>
            <Tabs>
              <Tabs.Tab onClick={() => setActiveTab(0)} active={activeTab == 0}>
                Add Book(s)
              </Tabs.Tab>
              <Tabs.Tab onClick={() => setActiveTab(1)} active={activeTab == 1}>
                New Collection
              </Tabs.Tab>
            </Tabs>
            <NewCollection show={activeTab == 1} save={save} />
            <AddBook show={activeTab == 0} save={save} />
          </Modal.Card.Body>
          <Modal.Card.Footer>
            <button className="button is-success" ref={save}>
              Save changes
            </button>
            <Button color="danger">Cancel</Button>
          </Modal.Card.Footer>
        </Modal.Card>
      </Modal>

      <div className={styles.addMenu} onClick={() => setShow(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
    </>
  );
};

export default AddMenu;
