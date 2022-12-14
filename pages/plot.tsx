import styles from '../styles/Plot.module.scss';
import dynamic from "next/dynamic";
import {useState} from "react";
import {NextPage} from "next";
import Base from "../components/Base/Base";
import DomcolGL from "../components/_plot/DomcolGL/DomcolGL";
import {Drawer, Space} from "antd";
import MathGLSL from "../data/parser/mathGLSL";
import {useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {motion} from "framer-motion";

// avoid server-side rendering on Editor to prevent "window is not defined"
const Editor = dynamic(() => import("../components/_plot/Editor/Editor"), { ssr: false });


const Plot: NextPage = () => {
    /** The current equations in the editor. These are parsed to GLSL. */
    const equations = useSelector((state: RootState) => state.equations);
    /** The current GLSL code that is being rendered. */
    const [code, setCode] = useState<string>(parseEquationsToGlsl());
    /** Whether a reload is being forced to the {@link DomcolGL} component. Used to re-render. */
    const [reload, setReload] = useState<boolean>(false);
    /** Whether the editor is open. */
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);


    /**
     * Parses the current {@link equations} to GLSL and returns the result.
     * @return The corresponding GLSL code
     */
    function parseEquationsToGlsl(): string {
        let glslPerEquation = equations.map(latex => MathGLSL.parse(latex));
        return glslPerEquation.join('\n\n');
    }

    /**
     * Called when the plot-button is clicked. Updates the current {@link code}
     * and forces a reload to the {@link DomcolGL} component. The reload takes
     * exactly 1ms.
     */
    function handlePlotButtonClicked() {
        setCode(parseEquationsToGlsl());
        setReload(true);
        setTimeout(() => {
            setReload(false);
        }, 1);
    }

    /**
     * Toggles the editor's state (open/closed).
     */
    function handleToggleEditor() {
        setIsEditorOpen(!isEditorOpen);
    }

    return (
        <Base title="DomcolJS | Plot">

            {/* Main Container */}
            <motion.div
                className={styles.context}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
            >

                {/* Domain Coloring */}
                <div className={styles.domainColoringWrapper}>
                    <DomcolGL code={code} reload={reload} />
                </div>

                {/* Editor */}
                <Drawer
                    className={styles.editorDrawer}
                    title="Plot Editor"
                    placement="right"
                    open={isEditorOpen}
                    onClose={handleToggleEditor}
                    width="fit-content"
                    extra={
                        <Space>
                            <button className={styles.closeEditorButton} onClick={handleToggleEditor}>
                                Close
                            </button>
                        </Space>
                    }
                >
                    <div className={styles.editorDrawerContent}>
                        <Editor />
                    </div>
                </Drawer>

                {/* Nav with editor buttons */}
                <nav className={styles.editorButtonsNav}>
                    {/* Open editor */}
                    <button className={styles.openEditorButton} onClick={handleToggleEditor}>
                        Edit
                    </button>
                    {/* Plot current code */}
                    <button className={styles.plotButton} onClick={handlePlotButtonClicked}>
                        Plot
                    </button>
                </nav>

            </motion.div>

        </Base>
    );
}

export default Plot;
