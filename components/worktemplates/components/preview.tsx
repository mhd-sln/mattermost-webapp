// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {AccordionItemType} from 'components/common/accordion/accordion';
import {CSSTransition} from 'react-transition-group'; // ES6

import {getTemplateDefaultIllustration} from '../utils';

import {Board, Channel, Integration, Playbook, WorkTemplate} from '@mattermost/types/worktemplates';

import ModalBody from './modal_body';
import Accordion from './preview/accordion';
import Chip from './preview/chip';
import PreviewSection from './preview/section';

export interface PreviewProps {
    className?: string;
    template: WorkTemplate;
}

const Preview = ({template, ...props}: PreviewProps) => {
    const {formatMessage} = useIntl();
    const nodeRef = useRef(null);
    const [illustrationMount, setIllustrationMount] = useState(true);
    const [currentIllustration, setCurrentIllustration] = useState<[string, string]>(getTemplateDefaultIllustration(template));

    useEffect(() => {
        setIllustrationMount(true);
    }, [currentIllustration[1]]);

    const [channels, boards, playbooks, integrations] = useMemo(() => {
        const channels: Channel[] = [];
        const boards: Board[] = [];
        const playbooks: Playbook[] = [];
        const integrations: Integration[] = [];
        template.content.forEach((c) => {
            if (c.channel) {
                channels.push(c.channel);
            }
            if (c.board) {
                boards.push(c.board);
            }
            if (c.playbook) {
                playbooks.push(c.playbook);
            }
            if (c.integration) {
                integrations.push(c.integration);
            }
        });
        return [channels, boards, playbooks, integrations];
    }, [template.content]);

    // building accordion items
    const accordionItemsData: AccordionItemType[] = [];
    if (channels.length > 0) {
        accordionItemsData.push({
            id: 'channels',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_channels', defaultMessage: 'Channels'}),
            extraContent: <Chip>{channels.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'channels'}
                    message={template.description.channel.message}
                    items={channels}
                    onUpdateIllustration={(id: string, illustration: string) => setCurrentIllustration([id, illustration])}
                />
            )],
        });
    }
    if (boards.length > 0) {
        accordionItemsData.push({
            id: 'boards',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_boards', defaultMessage: 'Boards'}),
            extraContent: <Chip>{boards.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'boards'}
                    message={template.description.board.message}
                    items={boards}
                    onUpdateIllustration={(id: string, illustration: string) => setCurrentIllustration([id, illustration])}
                />
            )],
        });
    }
    if (playbooks.length > 0) {
        accordionItemsData.push({
            id: 'playbooks',
            title: formatMessage({id: 'worktemplates.preview.accordion_title_playbooks', defaultMessage: 'Playbooks'}),
            extraContent: <Chip>{playbooks.length}</Chip>,
            items: [(
                <PreviewSection
                    key={'playbooks'}
                    message={template.description.playbook.message}
                    items={playbooks}
                    onUpdateIllustration={(id: string, illustration: string) => setCurrentIllustration([id, illustration])}
                />
            )],
        });
    }
    if (integrations.length > 0) {
        accordionItemsData.push({
            id: 'integrations',
            title: 'Integrations',
            extraContent: <Chip>{integrations.length}</Chip>,
            items: [<h1 key='integrations'>{'todo: integrations'}</h1>],
        });
    }

    // When opening an accordion section, change the illustration to whatever has been open
    const handleItemOpened = (index: number) => {
        const item = accordionItemsData[index];

        setIllustrationMount(false);
        switch (item.id) {
        case 'channels':
            setCurrentIllustration(['channels', channels[0].illustration]);
            break;
        case 'boards':
            setCurrentIllustration(['boards', boards[0].illustration]);
            break;
        case 'playbooks':
            setCurrentIllustration(['playbooks', playbooks[0].illustration]);
            break;
        case 'integrations':
            setCurrentIllustration(['integrations', template.description.integration.illustration]);
        }
    };

    return (
        <div className={props.className}>
            <ModalBody>
                <strong>{formatMessage({id: 'worktemplates.preview.included_in_template_title', defaultMessage: 'Included in template'})}</strong>
                <Accordion
                    accordionItemsData={accordionItemsData}
                    openFirstElement={true}
                    onItemOpened={handleItemOpened}
                />
            </ModalBody>
            <CSSTransition
                nodeRef={nodeRef}
                in={illustrationMount}
                timeout={50}
                classNames='illustration'
                onExit={() => {
                    console.log('onexit');
                }}
                onEnter={() => {
                    console.log('onentering');
                }}
            >
                <img
                    ref={nodeRef}
                    src={currentIllustration[1]}
                />
            </CSSTransition>

        </div>
    );
};

const StyledPreview = styled(Preview)`
    display: flex;

    strong {
        display: block;
        font-family: 'Metropolis';
        font-weight: 600;
        font-size: 18px;
        line-height: 24px;
        color: var(--center-channel-text);
        margin-bottom: 8px;
    }

    img {
        box-shadow: var(--elevation-2);
        border-radius: 8px;
    }

    .illustration-enter {
      opacity: 0.25;
    }

    .illustration-enter-active {
      opacity: 1;
      transition: opacity 100ms ease-in-out;
    }

`;

export default StyledPreview;
