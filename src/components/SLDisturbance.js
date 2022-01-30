import React, { useState, useEffect } from 'react'
import tunnelWrap from '../TunnelWrap'
import PropertyValidator, { PropertyValidatorType } from './PropertyValidator'

export default function SLDisturbance(props) {
	const [validProperties] = useState(
		PropertyValidator(props, {
			apiKey: PropertyValidatorType.regexp(/[a-z0-9]/),
		})
	)

	const [disturbanceData, setDisturbanceData] = useState([])

	const urlSearchParams = {
		key: props.apiKey,
		...(props.transportMode && { transportMode: props.transportMode }),
		...(props.lineNumber && { lineNumber: props.lineNumber }),
	}

	const [urlParameters] = useState(new URLSearchParams(urlSearchParams))
	const [refreshToggle, issueRefresh] = useState(true)

	useEffect(() => {
		if (!validProperties) {
			return
		}

		tunnelWrap({
			url: `http://api.sl.se/api2/deviations.JSON?${urlParameters}`,
		}).then(res => {
			setDisturbanceData(
				res.data['ResponseData'].map(r =>
					Object.assign(
						(({ Scope, Header, Details }) => ({
							Scope,
							Header,
							Details,
						}))(r),
						{
							open: false,
						}
					)
				)
			)
		})
	}, [refreshToggle, validProperties, urlParameters])

	useEffect(() => {
		const interval = setInterval(() => {
			issueRefresh(!refreshToggle)
		}, props.refreshRate)

		return () => clearInterval(interval)
	}, [issueRefresh, refreshToggle, props.refreshRate])

	const refresh = () => {
		issueRefresh(!refreshToggle)
	}

	const toggleDisplay = index => {
		document.querySelectorAll(`div.sl-disturbance div div.details`)[index].classList.toggle('open')
	}

	return (
		<div className="sl-disturbance">
			<span onClick={refresh} className="mdi mdi-subway-alert-variant" />
			{disturbanceData.map((item, index) => (
				<div key={index}>
					<div className="header" onClick={() => toggleDisplay(index)}>
						<h4>
							{item['Scope']} - {item['Header']}
						</h4>
					</div>
					<div className={'details ' + (item['open'] ? 'open' : '')}>
						<p>{item['Details']}</p>
					</div>
				</div>
			))}
		</div>
	)
}
